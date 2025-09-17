import { produce } from "immer";
import { isEqual, size } from "lodash";
import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand";

import { getInitialPositionForPlayer } from "@/utils/game/positions";
import { createAsyncAction } from "@/utils/stores";

import type { Lineup, LineupEntry } from "@/utils/game/lineups";
import type { ActionWrapper } from "@/utils/stores";
import type { Player, TeamRole } from "@/utils/supabase/database.types";
import type { WritableDraft } from "immer";
import type { TeamRosterPlayer } from "../queries";

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
    isDirty: boolean;
    isSaving: boolean;
    // Flag to prevent saving the lineup while optimistic changes to the roster are pending
    preventSaving: boolean;
  };
};

export type GameStoreState = {
  teams: Record<TeamRole, TeamState>;
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

export type GameStoreActions = {
  addPlayerToGame: ActionWrapper<AddPlayerToGameFields>;
  removePlayerFromGame: ActionWrapper<RosterChangeFields>;
  movePlayerToBench: (args: RosterChangeFields) => void;
  movePlayerToLineup: (args: MovePlayerToLineupFields) => void;
};

export type GameStore = GameStoreState & GameStoreActions;

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
      action({ teams }, { playerId, teamRole, isBenchPlayer, lineupIndex }, isOptimistic) {
        const newTeams = produce(teams, ({ [teamRole]: team }) => {
          // Player not on team roster
          if (!(playerId in team.rosterPlayers)) {
            return;
          }
          // Player already in game
          if (team.gamePlayers.has(playerId)) {
            return;
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
        return { teams: newTeams };
      },
      success({ teams }, { playerId, teamRole, isBenchPlayer }) {
        const newTeams = produce(teams, ({ [teamRole]: team }) => {
          team.pendingPlayerAdditions.delete(playerId);
          if (!isBenchPlayer) {
            if (!hasPendingOperations(team)) {
              team.lineup.preventSaving = false;
            }
          }
        });
        return { teams: newTeams };
      },
      error({ teams }, { playerId, teamRole, isBenchPlayer }) {
        const newTeams = produce(teams, ({ [teamRole]: team }) => {
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
        return { teams: newTeams };
      },
    }),
    removePlayerFromGame: createAsyncAction(set)<RosterChangeFields>({
      action({ teams }, { playerId, teamRole }, isOptimistic) {
        const newTeams = produce(teams, ({ [teamRole]: team }) => {
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
        return { teams: newTeams };
      },
      success({ teams }, { playerId, teamRole }) {
        const newTeams = produce(teams, ({ [teamRole]: team }) => {
          delete team.pendingPlayerDeletions[playerId];
          if (!hasPendingOperations(team)) {
            team.lineup.preventSaving = false;
          }
        });
        return { teams: newTeams };
      },
      error({ teams }, { playerId, teamRole }) {
        const newTeams = produce(teams, ({ [teamRole]: team }) => {
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
        return { teams: newTeams };
      },
    }),
    movePlayerToBench: ({ playerId, teamRole }) => {
      set(({ teams }) => {
        const newTeams = produce(teams, ({ [teamRole]: team }) => {
          const index = team.lineup.current.players.findIndex(p => p.playerId === playerId);
          if (index === -1) {
            return;
          }
          const removed = team.lineup.current.players.splice(index, 1);
          if (removed.length > 0) {
            fixLineupOrder(team.lineup.current);
            team.lineup.isDirty = true;
          }
        });
        return { teams: newTeams };
      });
    },
    movePlayerToLineup: ({ playerId, teamRole, lineupIndex }) => {
      set(({ teams }) => {
        const newTeams = produce(teams, ({ [teamRole]: team }) => {
          const { player } = team.rosterPlayers[playerId];
          const lineup = team.lineup.current;
          addPlayerToLineup(lineup, player, lineupIndex);
          team.lineup.isDirty = true;
        });
        return { teams: newTeams };
      });
    },
  }));

export type GameStoreApi = ReturnType<typeof createGameStore>;

export const gameStoreContext = createContext<GameStoreApi | undefined>(undefined);

export const useGameStore = <T>(selector: (state: GameStore) => T) => {
  const gameStore = useContext(gameStoreContext);
  if (!gameStore) {
    throw new Error("Must be wrapped in GameStoreProvider");
  }
  return useStore(gameStore, selector);
};
