import { arrayMove } from "@dnd-kit/sortable";
import { produce } from "immer";
import { isEqual, size } from "lodash";
import { createContext, use } from "react";
import { createStore, useStore } from "zustand";

import { getInitialPositionForPlayer } from "@/utils/game/positions";
import { createAsyncAction } from "@/utils/stores";

import type { Lineup, LineupEntry } from "@/utils/game/lineups";
import type { ActionWrapper } from "@/utils/stores";
import type { FieldingPosition, Player, TeamRole } from "@/utils/supabase/database.types";
import type { WritableDraft } from "immer";
import type { TeamRosterPlayer } from "../queries";

export const TEAM_ROSTER_CONTAINER_ID = "team-roster";
export const TEAM_LINEUP_CONTAINER_ID = "team-lineup";
export const BENCH_CONTAINER_ID = "bench";

export type ContainerId =
  | typeof TEAM_ROSTER_CONTAINER_ID
  | typeof TEAM_LINEUP_CONTAINER_ID
  | typeof BENCH_CONTAINER_ID;

export type TeamState = {
  id: string;
  name: string;
  rosterPlayers: Record<string, TeamRosterPlayer>;
  gamePlayers: Set<string>;
  // Players added by optimistic changes, will also appear in the gamePlayers set
  pendingPlayerAdditions: Set<string>;
  // Players deleted by optimistic changes
  pendingPlayerDeletions: Record<string, { lineupEntry: LineupEntry | undefined }>;
  lineup: {
    current: Lineup;
    saved: Lineup | null;
    saving: Lineup | null;
    isDirty: boolean;
    isSaving: boolean;
    // Flag to prevent saving the lineup while optimistic changes to the roster are pending
    preventSaving: boolean;
  };
};

type DraggingState = {
  activePlayerId: string | null;
  originContainer: ContainerId | null;
  overContainer: ContainerId | null;
  overLineupIndex: number | null;
};

export type GameStoreState = {
  teams: Record<TeamRole, TeamState>;
  dragging: DraggingState;
};

type RosterChangeFields = {
  playerId: string;
  teamRole: TeamRole;
};

type MovePlayerToLineupFields = RosterChangeFields & {
  lineupIndex?: number;
};

type AddPlayerToGameFields = MovePlayerToLineupFields & {
  isBenchPlayer: boolean;
};

type ChangePlayerPositionFields = RosterChangeFields & {
  position: FieldingPosition;
};

type ChangePlayerBattingOrderFields = RosterChangeFields & {
  lineupIndex: number;
};

export type GameStoreActions = {
  addPlayerToGame: ActionWrapper<AddPlayerToGameFields>;
  removePlayerFromGame: ActionWrapper<RosterChangeFields>;
  movePlayerToBench: (args: RosterChangeFields) => void;
  movePlayerToLineup: (args: MovePlayerToLineupFields) => void;
  changePlayerPosition: (args: ChangePlayerPositionFields) => void;
  changePlayerBattingOrder: (args: ChangePlayerBattingOrderFields) => void;
  saveLineup: ActionWrapper<{ teamRole: TeamRole }>;
  startDraggingPlayer: (args: { playerId: string; containerId: ContainerId }) => void;
  updateDraggingPlayer: (args: {
    overContainer: ContainerId | null;
    overLineupIndex?: number | null;
  }) => void;
  stopDraggingPlayer: () => void;
};

export type GameStore = GameStoreState & GameStoreActions;

// Edit a team in the store using an immer mutation
function editTeam(
  { teams }: GameStoreState,
  teamRole: TeamRole,
  fn: (team: WritableDraft<TeamState>) => void,
) {
  return {
    teams: produce(teams, ({ [teamRole]: team }) => {
      fn(team);
    }),
  };
}

function fixLineupOrder(lineup: WritableDraft<Lineup>) {
  lineup.players.forEach((p, index) => {
    p.battingOrder = index + 1;
  });
}

function addPlayerToLineup(
  lineup: WritableDraft<Lineup>,
  player: Player<"id" | "primary_position" | "secondary_position">,
  lineupIndex?: number,
) {
  const position = getInitialPositionForPlayer(player, lineup);
  if (lineupIndex === undefined) {
    lineup.players.push({ playerId: player.id, battingOrder: lineup.players.length + 1, position });
  } else {
    lineup.players.splice(lineupIndex, 0, {
      playerId: player.id,
      battingOrder: lineupIndex + 1,
      position,
    });
  }
  fixLineupOrder(lineup);
}

function hasPendingOperations(team: TeamState) {
  return team.pendingPlayerAdditions.size > 0 || size(team.pendingPlayerDeletions) > 0;
}

export const createGameStore = (initialState: GameStoreState) =>
  createStore<GameStore>()(set => ({
    ...initialState,
    addPlayerToGame: createAsyncAction(set)<AddPlayerToGameFields>({
      action(state, { playerId, teamRole, isBenchPlayer, lineupIndex }, isOptimistic) {
        return editTeam(state, teamRole, team => {
          // Player not on team roster
          if (!(playerId in team.rosterPlayers)) {
            return;
          }
          // Player already in game
          if (team.gamePlayers.has(playerId)) {
            return;
          }

          if (!isBenchPlayer) {
            if (team.lineup.current.players.some(p => p.playerId === playerId)) {
              return;
            }
          }

          // Add to game roster
          team.gamePlayers.add(playerId);
          if (isOptimistic) {
            team.pendingPlayerAdditions.add(playerId);
          }

          // Add to lineup if not on the bench
          // If this change wasn't optimistic it means it was triggered by a database update,
          // in that case we should wait for the lineup to be updated as well
          if (!isBenchPlayer && isOptimistic) {
            const { player } = team.rosterPlayers[playerId];
            const lineup = team.lineup.current;
            addPlayerToLineup(lineup, player, lineupIndex);
            team.lineup.isDirty = true;
            team.lineup.preventSaving = true;
          }
        });
      },
      success(state, { playerId, teamRole, isBenchPlayer }) {
        return editTeam(state, teamRole, team => {
          team.pendingPlayerAdditions.delete(playerId);
          if (!isBenchPlayer) {
            if (!hasPendingOperations(team)) {
              team.lineup.preventSaving = false;
            }
          }
        });
      },
      error(state, { playerId, teamRole, isBenchPlayer }) {
        return editTeam(state, teamRole, team => {
          if (!team.pendingPlayerAdditions.has(playerId)) {
            return;
          }
          team.gamePlayers.delete(playerId);
          team.pendingPlayerAdditions.delete(playerId);

          if (!isBenchPlayer) {
            team.lineup.current.players = team.lineup.current.players.filter(
              p => p.playerId !== playerId,
            );
            fixLineupOrder(team.lineup.current);
            // If this was the only change to the lineup, mark it as not dirty
            if (isEqual(team.lineup.current, team.lineup.saved)) {
              team.lineup.isDirty = false;
            }
            if (!hasPendingOperations(team)) {
              team.lineup.preventSaving = false;
            }
          }
        });
      },
    }),
    removePlayerFromGame: createAsyncAction(set)<RosterChangeFields>({
      action(state, { playerId, teamRole }, isOptimistic) {
        return editTeam(state, teamRole, team => {
          if (!team.gamePlayers.has(playerId)) {
            return;
          }
          team.gamePlayers.delete(playerId);
          const lineupEntry = team.lineup.current.players.find(p => p.playerId === playerId);
          if (lineupEntry) {
            team.lineup.current.players.splice(lineupEntry.battingOrder - 1, 1);
            fixLineupOrder(team.lineup.current);
            team.lineup.isDirty = true;
          }
          if (isOptimistic) {
            team.pendingPlayerDeletions[playerId] = { lineupEntry };
            team.lineup.preventSaving = true;
          }
        });
      },
      success(state, { playerId, teamRole }) {
        return editTeam(state, teamRole, team => {
          delete team.pendingPlayerDeletions[playerId];
          if (!hasPendingOperations(team)) {
            team.lineup.preventSaving = false;
          }
        });
      },
      error(state, { playerId, teamRole }) {
        return editTeam(state, teamRole, team => {
          team.gamePlayers.add(playerId);
          const { lineupEntry } = team.pendingPlayerDeletions[playerId];
          if (lineupEntry) {
            team.lineup.current.players.splice(lineupEntry.battingOrder - 1, 0, lineupEntry);
            fixLineupOrder(team.lineup.current);
            if (isEqual(team.lineup.current, team.lineup.saved)) {
              team.lineup.isDirty = false;
            }
          }
          delete team.pendingPlayerDeletions[playerId];
          if (!hasPendingOperations(team)) {
            team.lineup.preventSaving = false;
          }
        });
      },
    }),
    movePlayerToBench: ({ playerId, teamRole }) => {
      set(state =>
        editTeam(state, teamRole, team => {
          const index = team.lineup.current.players.findIndex(p => p.playerId === playerId);
          if (index === -1) {
            return;
          }
          const removed = team.lineup.current.players.splice(index, 1);
          if (removed.length > 0) {
            fixLineupOrder(team.lineup.current);
            team.lineup.isDirty = true;
          }
        }),
      );
    },
    movePlayerToLineup: ({ playerId, teamRole, lineupIndex }) => {
      set(state => {
        return editTeam(state, teamRole, team => {
          const { player } = team.rosterPlayers[playerId];
          const lineup = team.lineup.current;
          addPlayerToLineup(lineup, player, lineupIndex);
          team.lineup.isDirty = true;
        });
      });
    },
    changePlayerPosition: ({ playerId, teamRole, position }) => {
      set(state => {
        return editTeam(state, teamRole, team => {
          const lineup = team.lineup.current;
          const lineupEntry = lineup.players.find(p => p.playerId === playerId);
          if (!lineupEntry) {
            return;
          }
          const playerWithPosition = lineup.players.find(p => p.position === position);
          if (playerWithPosition) {
            const { player } = team.rosterPlayers[playerWithPosition.playerId];
            const newPosition = getInitialPositionForPlayer(player, lineup, lineupEntry.position);
            playerWithPosition.position = newPosition;
          }
          lineupEntry.position = position;
          team.lineup.isDirty = true;
        });
      });
    },
    changePlayerBattingOrder: ({ playerId, teamRole, lineupIndex }) => {
      set(state => {
        return editTeam(state, teamRole, team => {
          if (lineupIndex < 0 || lineupIndex >= team.lineup.current.players.length) {
            return;
          }
          const lineup = team.lineup.current;
          const originLineupIndex = lineup.players.findIndex(p => p.playerId === playerId);
          if (originLineupIndex === -1) {
            return;
          }
          // Reorder the lineup
          team.lineup.current.players = arrayMove(lineup.players, originLineupIndex, lineupIndex);
          fixLineupOrder(team.lineup.current);
          team.lineup.isDirty = true;
        });
      });
    },
    saveLineup: createAsyncAction(set)<{ teamRole: TeamRole }>({
      action(state, { teamRole }) {
        return editTeam(state, teamRole, team => {
          team.lineup.isSaving = true;
          team.lineup.saving = team.lineup.current;
        });
      },
      success(state, { teamRole }) {
        return editTeam(state, teamRole, team => {
          team.lineup.isSaving = false;
          team.lineup.saved = team.lineup.saving;
          team.lineup.saving = null;
          team.lineup.isDirty = !isEqual(team.lineup.current, team.lineup.saved);
        });
      },
      error(state, { teamRole }) {
        return editTeam(state, teamRole, team => {
          team.lineup.isSaving = false;
          team.lineup.saving = null;
        });
      },
    }),
    startDraggingPlayer: ({ playerId, containerId }) => {
      set(({ dragging }) => ({
        dragging: {
          ...dragging,
          activePlayerId: playerId,
          originContainer: containerId,
        },
      }));
    },
    updateDraggingPlayer: args => {
      set(({ dragging }) => ({
        dragging: {
          ...dragging,
          ...args,
        },
      }));
    },
    stopDraggingPlayer: () => {
      set({
        dragging: {
          activePlayerId: null,
          originContainer: null,
          overContainer: null,
          overLineupIndex: null,
        },
      });
    },
  }));

export type GameStoreApi = ReturnType<typeof createGameStore>;

export const gameStoreContext = createContext<GameStoreApi | undefined>(undefined);

export const useGameStoreApi = () => {
  const gameStore = use(gameStoreContext);
  if (!gameStore) {
    throw new Error("Must be wrapped in GameStoreProvider");
  }
  return gameStore;
};

export const useGameStore = <T>(selector: (state: GameStore) => T) => {
  const gameStore = useGameStoreApi();
  return useStore(gameStore, selector);
};
