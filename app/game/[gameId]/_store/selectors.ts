import { sortBy } from "lodash";
import { createSelector } from "reselect";

import { getPositionAbbreviation } from "@/utils/display";
import { getPossiblePositions } from "@/utils/game/positions";

import { BENCH_CONTAINER_ID, TEAM_LINEUP_CONTAINER_ID, TEAM_ROSTER_CONTAINER_ID } from "./store";

import type { TeamRole } from "@/utils/supabase/database.types";
import type { ContainerId, GameStoreState } from "./store";

const getDraggingState = (state: GameStoreState) => state.dragging;
export const getActiveDraggingPlayer = createSelector(
  getDraggingState,
  ({ activePlayerId }) => activePlayerId,
);
export const getDraggingOverContainer = createSelector(
  getDraggingState,
  ({ overContainer }) => overContainer,
);
export const getDraggingOriginContainer = createSelector(
  getDraggingState,
  ({ originContainer }) => originContainer,
);

const getTeam = (state: GameStoreState, teamRole: TeamRole) => state.teams[teamRole];
export const getLineup = createSelector(getTeam, ({ lineup }) => lineup.current);
const getAllRosterPlayers = createSelector(getTeam, ({ rosterPlayers }) => rosterPlayers);
const getGamePlayers = createSelector(getTeam, ({ gamePlayers }) => gamePlayers);
const getPendingPlayerAdditions = createSelector(
  getTeam,
  ({ pendingPlayerAdditions }) => pendingPlayerAdditions,
);
const getPendingPlayerDeletions = createSelector(
  getTeam,
  ({ pendingPlayerDeletions }) => pendingPlayerDeletions,
);

export const isLineupPlayerPending = createSelector(
  getPendingPlayerAdditions,
  (_: GameStoreState, __: TeamRole, playerId: string) => playerId,
  (pendingPlayerAdditions, playerId) => pendingPlayerAdditions.has(playerId),
);

export const isPlayerRemovalPending = createSelector(
  getPendingPlayerDeletions,
  (_: GameStoreState, __: TeamRole, playerId: string) => playerId,
  (pendingPlayerDeletions, playerId) => pendingPlayerDeletions[playerId] !== undefined,
);

const getRosterPlayer = createSelector(
  getAllRosterPlayers,
  (_: GameStoreState, __: TeamRole, playerId: string) => playerId,
  (rosterPlayers, playerId) => rosterPlayers[playerId],
);
const isPlayerInGame = createSelector(
  getGamePlayers,
  (_: GameStoreState, __: TeamRole, playerId: string) => playerId,
  (gamePlayers, playerId) => gamePlayers.has(playerId),
);
const getPlayerLineupEntry = createSelector(
  getLineup,
  (_: GameStoreState, __: TeamRole, playerId: string) => playerId,
  (lineup, playerId) => lineup.players.find(p => p.playerId === playerId),
);

export const getPlayerLineupIndex = createSelector(
  getLineup,
  (_: GameStoreState, __: TeamRole, playerId: string) => playerId,
  (lineup, playerId) => lineup.players.findIndex(p => p.playerId === playerId),
);

const getFieldingConfiguration = createSelector(getLineup, lineup => lineup.fieldingConfiguration);
const getFieldingPositions = createSelector(getFieldingConfiguration, fieldingConfiguration =>
  getPossiblePositions(fieldingConfiguration),
);
export const getFieldingPositionOptions = createSelector(getFieldingPositions, positions =>
  positions.map(position => ({ value: position, label: getPositionAbbreviation(position) })),
);

export const getLineupViewPlayer = createSelector(
  getRosterPlayer,
  isPlayerInGame,
  getPlayerLineupEntry,
  isLineupPlayerPending,
  isPlayerRemovalPending,
  (rosterPlayer, isInGame, lineupEntry, isPending, isRemovalPending) => {
    if (!isInGame) {
      return {
        ...rosterPlayer,
        isInGame: false,
        isRemovalPending,
      } as const;
    }
    if (!lineupEntry) {
      return {
        ...rosterPlayer,
        isInGame: true,
        isPending,
        isInLineup: false,
      } as const;
    }
    return {
      ...rosterPlayer,
      isInGame: true,
      isInLineup: true,
      lineupEntry,
      isPending,
    } as const;
  },
);
export type LineupViewPlayer = ReturnType<typeof getLineupViewPlayer>;

const getAllPlayerIds = createSelector(
  getAllRosterPlayers,
  rosterPlayers => new Set([...Object.keys(rosterPlayers)]),
);

const getPlayersNotInGame = createSelector(
  getAllPlayerIds,
  getGamePlayers,
  (playerIds, gamePlayers) => playerIds.difference(gamePlayers),
);

const getPlayersNotInGameArray = createSelector(getPlayersNotInGame, playersNotInGame => [
  ...playersNotInGame,
]);

export const getPlayerIdsInLineup = createSelector(getLineup, lineup =>
  lineup.players.map(p => p.playerId),
);

const getPlayerIdsInLineupSet = createSelector(
  getPlayerIdsInLineup,
  playersIdsInLineup => new Set(playersIdsInLineup),
);

const getPlayersNotInLineup = createSelector(
  getGamePlayers,
  getPlayerIdsInLineupSet,
  (gamePlayers, playersInLineup) => gamePlayers.difference(playersInLineup),
);

const getPlayersNotInLineupArray = createSelector(getPlayersNotInLineup, playersNotInLineup => [
  ...playersNotInLineup,
]);

const getVisibleRosterPlayersUnsorted = createSelector(
  getActiveDraggingPlayer,
  getDraggingOverContainer,
  getDraggingOriginContainer,
  getPlayersNotInGameArray,
  (draggingPlayerId, overContainer, originContainer, players) => {
    if (!draggingPlayerId || !overContainer || overContainer === originContainer) {
      return players;
    }
    if (overContainer === TEAM_ROSTER_CONTAINER_ID) {
      return [...players, draggingPlayerId];
    }
    return players.filter(id => id !== draggingPlayerId);
  },
);

export const getVisibleRosterPlayers = createSelector(
  getAllRosterPlayers,
  getVisibleRosterPlayersUnsorted,
  (rosterPlayers, visibleRosterPlayers) => {
    return sortBy(visibleRosterPlayers, playerId => rosterPlayers[playerId].player.name);
  },
);

export const getVisibleLineupPlayers = createSelector(
  getActiveDraggingPlayer,
  getDraggingOverContainer,
  getDraggingOriginContainer,
  getPlayerIdsInLineup,
  (draggingPlayerId, overContainer, originContainer, lineupPlayers) => {
    if (!draggingPlayerId || !overContainer || overContainer === originContainer) {
      return lineupPlayers;
    }

    if (overContainer !== TEAM_LINEUP_CONTAINER_ID) {
      return lineupPlayers.filter(id => id !== draggingPlayerId);
    }

    return [...lineupPlayers, draggingPlayerId];
  },
);

const getVisibleBenchPlayersUnsorted = createSelector(
  getActiveDraggingPlayer,
  getDraggingOverContainer,
  getDraggingOriginContainer,
  getPlayersNotInLineupArray,
  (draggingPlayerId, overContainer, originContainer, players) => {
    if (!draggingPlayerId || !overContainer || overContainer === originContainer) {
      return players;
    }

    if (overContainer === BENCH_CONTAINER_ID) {
      return [...players, draggingPlayerId];
    }
    return players.filter(id => id !== draggingPlayerId);
  },
);

export const getVisibleBenchPlayers = createSelector(
  getAllRosterPlayers,
  getVisibleBenchPlayersUnsorted,
  (rosterPlayers, benchPlayers) =>
    sortBy(benchPlayers, playerId => rosterPlayers[playerId].player.name),
);

export const getVisiblePlayerIds = createSelector(
  getVisibleRosterPlayers,
  getVisibleLineupPlayers,
  getVisibleBenchPlayers,
  (_: GameStoreState, __: TeamRole, containerId: ContainerId) => containerId,
  (rosterPlayers, lineupPlayers, benchPlayers, containerId) => {
    if (containerId === TEAM_LINEUP_CONTAINER_ID) {
      return lineupPlayers;
    }
    if (containerId === TEAM_ROSTER_CONTAINER_ID) {
      return rosterPlayers;
    }
    return benchPlayers;
  },
);

export const getPlayerOriginContainer = createSelector(
  getGamePlayers,
  getPlayerIdsInLineupSet,
  (_: GameStoreState, __: TeamRole, playerId: string) => playerId,
  (gamePlayers, playersInLineup, playerId) => {
    if (playersInLineup.has(playerId)) {
      return TEAM_LINEUP_CONTAINER_ID;
    }
    if (gamePlayers.has(playerId)) {
      return BENCH_CONTAINER_ID;
    }
    return TEAM_ROSTER_CONTAINER_ID;
  },
);

export const getLineupStatus = createSelector(
  getTeam,
  ({ lineup: { isDirty, isSaving, preventSaving } }) => ({ isDirty, isSaving, preventSaving }),
);

export const isDraggingFromGame = createSelector(
  getDraggingOriginContainer,
  originContainer =>
    originContainer === TEAM_LINEUP_CONTAINER_ID || originContainer === BENCH_CONTAINER_ID,
);
