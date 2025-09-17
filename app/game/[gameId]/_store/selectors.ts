import { sortBy } from "lodash";
import { createSelector } from "reselect";

import { getPositionAbbreviation } from "@/utils/display";
import { getPossiblePositions } from "@/utils/game/positions";

import type { TeamRole } from "@/utils/supabase/database.types";
import type { GameStoreState } from "./store";

const getTeam = (state: GameStoreState, teamRole: TeamRole) => state.teams[teamRole];
const getLineup = createSelector(getTeam, ({ lineup }) => lineup.current);
const getAllRosterPlayers = createSelector(getTeam, ({ rosterPlayers }) => rosterPlayers);
const getGamePlayers = createSelector(getTeam, ({ gamePlayers }) => gamePlayers);
const getPendingPlayerAdditions = createSelector(
  getTeam,
  ({ pendingPlayerAdditions }) => pendingPlayerAdditions,
);

export const isLineupPlayerPending = createSelector(
  getPendingPlayerAdditions,
  (_: GameStoreState, __: TeamRole, playerId: string) => playerId,
  (pendingPlayerAdditions, playerId) => pendingPlayerAdditions.has(playerId),
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
  (rosterPlayer, isInGame, lineupEntry, isPending) => {
    if (!isInGame) {
      return {
        ...rosterPlayer,
        isInGame: false,
      } as const;
    }
    if (!lineupEntry) {
      return {
        ...rosterPlayer,
        isInGame: true,
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

export const getPlayersIdsInLineup = createSelector(getLineup, lineup =>
  lineup.players.map(p => p.playerId),
);

const getPlayersNotInLineup = createSelector(
  getGamePlayers,
  getPlayersIdsInLineup,
  (gamePlayers, playersIdsInLineup) => gamePlayers.difference(new Set(playersIdsInLineup)),
);

export const getTeamRoster = createSelector(
  getAllRosterPlayers,
  getPlayersNotInGame,
  (rosterPlayers, playersNotInGame) =>
    sortBy([...playersNotInGame], playerId => rosterPlayers[playerId].player.name),
);

export const getTeamBench = createSelector(getPlayersNotInLineup, players => [...players]);
