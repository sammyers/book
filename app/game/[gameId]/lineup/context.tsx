import { partial } from "lodash";
import { useParams } from "next/navigation";
import { createContext, use, useCallback, useMemo } from "react";

import { createClient } from "@/utils/supabase/browser";

import {
  getFieldingPositionOptions,
  getLineupViewPlayer,
  getPlayersIdsInLineup,
  getTeamBench,
  getTeamRoster,
} from "../_store/selectors";
import { useGameStore } from "../_store/store";

import type { TeamRole } from "@/utils/supabase/database.types";
import type { ReactNode } from "react";

function useLineupView({ teamId }: { teamId: string }) {
  const { gameId } = useParams<{ gameId: string }>();

  const teams = useGameStore(state => state.teams);
  const teamRole = teams.away.id === teamId ? "away" : ("home" as TeamRole);

  const addPlayerToGame = useGameStore(state => state.addPlayerToGame);
  const removePlayerFromGame = useGameStore(state => state.removePlayerFromGame);
  const movePlayerToLineup = useGameStore(state => state.movePlayerToLineup);
  const movePlayerToBench = useGameStore(state => state.movePlayerToBench);

  const addPlayerToGameOptimistically = useCallback(
    async (playerId: string, isBenchPlayer: boolean, lineupIndex?: number) => {
      const supabase = createClient();
      const { handleSuccess, handleError } = addPlayerToGame(
        { playerId, teamRole, lineupIndex, isBenchPlayer },
        true,
      );
      const { error: supabaseError } = await supabase.from("game_roster_player").insert({
        game_id: gameId,
        team_id: teamId,
        player_id: playerId,
      });
      if (supabaseError) {
        handleError(supabaseError);
      } else {
        handleSuccess();
      }
    },
    [addPlayerToGame, teamRole, gameId, teamId],
  );

  const removePlayerFromGameOptimistically = useCallback(
    async (playerId: string) => {
      const supabase = createClient();
      const { handleSuccess, handleError } = removePlayerFromGame({ playerId, teamRole }, true);
      const { error: supabaseError } = await supabase
        .from("game_roster_player")
        .delete()
        .eq("game_id", gameId)
        .eq("team_id", teamId)
        .eq("player_id", playerId);
      if (supabaseError) {
        handleError(supabaseError);
      } else {
        handleSuccess();
      }
    },
    [removePlayerFromGame, teamRole, gameId, teamId],
  );

  const movePlayerFromLineupToBench = useCallback(
    (playerId: string) => movePlayerToBench({ playerId, teamRole }),
    [movePlayerToBench, teamRole],
  );

  const movePlayerFromBenchToLineup = useCallback(
    (playerId: string) => movePlayerToLineup({ playerId, teamRole }),
    [movePlayerToLineup, teamRole],
  );

  return {
    teamRole,
    addPlayerToGameOptimistically,
    removePlayerFromGameOptimistically,
    movePlayerFromLineupToBench,
    movePlayerFromBenchToLineup,
  };
}

type LineupViewContext = ReturnType<typeof useLineupView>;

export const LineupViewContext = createContext<LineupViewContext | undefined>(undefined);

export function LineupViewProvider({ children, teamId }: { children: ReactNode; teamId: string }) {
  const contextValue = useLineupView({ teamId });

  return <LineupViewContext value={contextValue}>{children}</LineupViewContext>;
}

export function useLineupViewContext() {
  const context = use(LineupViewContext);
  if (context === undefined) {
    throw new Error("useLineupViewContext must be used within a LineupViewProvider");
  }
  return context;
}

export const usePlayer = (playerId: string) => {
  const { teamRole } = useLineupViewContext();

  return useGameStore(state => getLineupViewPlayer(state, teamRole, playerId));
};

export const usePlayerActions = (playerId: string) => {
  const {
    addPlayerToGameOptimistically,
    removePlayerFromGameOptimistically,
    movePlayerFromBenchToLineup,
    movePlayerFromLineupToBench,
  } = useLineupViewContext();

  return useMemo(
    () => ({
      addToGame: partial(addPlayerToGameOptimistically, playerId),
      removeFromGame: partial(removePlayerFromGameOptimistically, playerId),
      moveToLineup: partial(movePlayerFromBenchToLineup, playerId),
      moveToBench: partial(movePlayerFromLineupToBench, playerId),
    }),
    [
      addPlayerToGameOptimistically,
      removePlayerFromGameOptimistically,
      movePlayerFromBenchToLineup,
      movePlayerFromLineupToBench,
      playerId,
    ],
  );
};

export const useFieldingPositionOptions = () => {
  const { teamRole } = useLineupViewContext();
  return useGameStore(state => getFieldingPositionOptions(state, teamRole));
};

export const useRoster = () => {
  const { teamRole } = useLineupViewContext();
  return useGameStore(state => getTeamRoster(state, teamRole));
};

export const useLineup = () => {
  const { teamRole } = useLineupViewContext();
  return useGameStore(state => getPlayersIdsInLineup(state, teamRole));
};

export const useBench = () => {
  const { teamRole } = useLineupViewContext();
  return useGameStore(state => getTeamBench(state, teamRole));
};
