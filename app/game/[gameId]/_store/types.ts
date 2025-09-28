import type { FieldingConfiguration, Lineup, LineupEntry } from "@/utils/game/lineups";
import type { GameConfiguration, GameData, OpponentLineupMode } from "@/utils/game/metadata";
import type { ActionWrapper } from "@/utils/stores";
import type { FieldingPosition, TeamRole } from "@/utils/supabase/database.types";
import type { TeamRosterPlayer } from "../queries";

export const TEAM_ROSTER_CONTAINER_ID = "team-roster";
export const TEAM_LINEUP_CONTAINER_ID = "team-lineup";
export const BENCH_CONTAINER_ID = "bench";

export type ContainerId =
  | typeof TEAM_ROSTER_CONTAINER_ID
  | typeof TEAM_LINEUP_CONTAINER_ID
  | typeof BENCH_CONTAINER_ID;

interface SaveableState<T> {
  current: T;
  saved: T | null;
  saving: T | null;
  isDirty: boolean;
  isSaving: boolean;
}

export function createSaveableState<T>(initialState: T): SaveableState<T> {
  return {
    current: initialState,
    saved: null,
    saving: null,
    isDirty: false,
    isSaving: false,
  };
}

export type TeamState = {
  id: string;
  name: string;
  rosterPlayers: Record<string, TeamRosterPlayer>;
  gamePlayers: Set<string>;
  // Players added by optimistic changes, will also appear in the gamePlayers set
  pendingPlayerAdditions: Set<string>;
  // Players deleted by optimistic changes
  pendingPlayerDeletions: Record<string, { lineupEntry: LineupEntry | undefined }>;
  lineup: SaveableState<Lineup> & {
    // Flag to prevent saving the lineup while optimistic changes to the roster are pending
    preventSaving: boolean;
  };
};

type DraggingState = {
  activePlayerId: string | null;
  originContainer: ContainerId | null;
  overContainer: ContainerId | null;
};

export type GameStoreState = {
  lineupViewSelectedTeamRole: TeamRole;
  teams: Record<TeamRole, TeamState>;
  dragging: DraggingState;
  gameData: SaveableState<GameData>;
};

export type RosterChangeFields = {
  playerId: string;
  teamRole: TeamRole;
};

type MovePlayerToLineupFields = RosterChangeFields & {
  lineupIndex?: number;
};

export type AddPlayerToGameFields = MovePlayerToLineupFields & {
  isBenchPlayer: boolean;
};

type ChangePlayerPositionFields = RosterChangeFields & {
  position: FieldingPosition;
};

type ChangePlayerBattingOrderFields = RosterChangeFields & {
  lineupIndex: number;
};

type ChangeFieldingConfigurationFields = {
  teamRole: TeamRole;
  fieldingConfiguration: Partial<FieldingConfiguration>;
};

export type GameStoreActions = {
  addPlayerToGame: ActionWrapper<AddPlayerToGameFields>;
  removePlayerFromGame: ActionWrapper<RosterChangeFields>;
  movePlayerToBench: (args: RosterChangeFields) => void;
  movePlayerToLineup: (args: MovePlayerToLineupFields) => void;
  changePlayerPosition: (args: ChangePlayerPositionFields) => void;
  changePlayerBattingOrder: (args: ChangePlayerBattingOrderFields) => void;
  changeFieldingConfiguration: (args: ChangeFieldingConfigurationFields) => void;
  saveLineup: ActionWrapper<{ teamRole: TeamRole }>;
  startDraggingPlayer: (args: { playerId: string; containerId: ContainerId }) => void;
  updateDraggingPlayer: (args: { overContainer: ContainerId | null }) => void;
  stopDraggingPlayer: () => void;
  setSelectedTeamRole: (teamRole: TeamRole) => void;
  updateGameConfiguration: (updates: Partial<GameConfiguration>) => void;
  updateOpponentLineupMode: (mode: OpponentLineupMode) => void;
  saveGameData: ActionWrapper;
};

export type GameStore = GameStoreState & GameStoreActions;
