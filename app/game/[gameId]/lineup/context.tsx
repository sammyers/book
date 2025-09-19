import { addToast } from "@heroui/react";
import { partial } from "lodash";
import { useParams } from "next/navigation";
import { createContext, use, useCallback, useEffect, useMemo } from "react";
import { useShallow } from "zustand/shallow";

import { createClient } from "@/utils/supabase/browser";

import {
  getFieldingPositionOptions,
  getLineup,
  getLineupStatus,
  getLineupViewPlayer,
  getPlayerLineupIndex as getPlayerLineupIndexSelector,
  getVisibleBenchPlayers,
  getVisibleLineupPlayers,
  getVisibleRosterPlayers,
} from "../_store/selectors";
import { useGameStore, useGameStoreApi } from "../_store/store";

import type { FieldingPosition, TeamRole } from "@/utils/supabase/database.types";
import type { ReactNode } from "react";
import type { GameStore } from "../_store/store";

function useLineupView({ teamId }: { teamId: string }) {
  const store = useGameStoreApi();

  const { gameId } = useParams<{ gameId: string }>();

  const teams = useGameStore(state => state.teams);
  const teamRole = teams.away.id === teamId ? "away" : ("home" as TeamRole);

  const addPlayerToGame = useGameStore(state => state.addPlayerToGame);
  const removePlayerFromGame = useGameStore(state => state.removePlayerFromGame);
  const movePlayerToLineup = useGameStore(state => state.movePlayerToLineup);
  const movePlayerToBench = useGameStore(state => state.movePlayerToBench);
  const changePlayerPositionAction = useGameStore(state => state.changePlayerPosition);
  const changePlayerBattingOrderAction = useGameStore(state => state.changePlayerBattingOrder);
  const saveLineupAction = useGameStore(state => state.saveLineup);

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
        addToast({
          title: "Error adding player to game",
          description: supabaseError.message,
          color: "danger",
        });
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
        addToast({
          title: "Error removing player from game",
          description: supabaseError.message,
          color: "danger",
        });
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
    (playerId: string, lineupIndex?: number) =>
      movePlayerToLineup({ playerId, teamRole, lineupIndex }),
    [movePlayerToLineup, teamRole],
  );

  const changePlayerPosition = useCallback(
    (playerId: string, position: FieldingPosition) =>
      changePlayerPositionAction({ playerId, teamRole, position }),
    [changePlayerPositionAction, teamRole],
  );

  const getPlayerLineupIndex = useCallback(
    (playerId: string) => getPlayerLineupIndexSelector(store.getState(), teamRole, playerId),
    [store, teamRole],
  );

  const changePlayerBattingOrder = useCallback(
    (playerId: string, lineupIndex: number) =>
      changePlayerBattingOrderAction({ playerId, teamRole, lineupIndex }),
    [changePlayerBattingOrderAction, teamRole],
  );

  const saveLineup = useCallback(async () => {
    const { isDirty, isSaving, preventSaving } = getLineupStatus(store.getState(), teamRole);
    if (!isDirty || preventSaving || isSaving) {
      return;
    }

    const supabase = createClient();
    const lineup = getLineup(store.getState(), teamRole);
    const { handleSuccess, handleError } = saveLineupAction({ teamRole }, true);
    const { error: supabaseError } = await supabase
      .from("lineup")
      .upsert({ game_id: gameId, team_id: teamId, lineup_data: lineup });
    if (supabaseError) {
      handleError(supabaseError);
      addToast({
        title: "Error saving lineup",
        description: supabaseError.message,
        color: "danger",
      });
    } else {
      handleSuccess();
    }
  }, [saveLineupAction, teamRole, gameId, teamId, store]);

  return {
    teamRole,
    getPlayerLineupIndex,
    addPlayerToGameOptimistically,
    removePlayerFromGameOptimistically,
    movePlayerFromLineupToBench,
    movePlayerFromBenchToLineup,
    changePlayerPosition,
    changePlayerBattingOrder,
    saveLineup,
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
    changePlayerPosition,
  } = useLineupViewContext();

  return useMemo(
    () => ({
      addToGame: partial(addPlayerToGameOptimistically, playerId),
      removeFromGame: partial(removePlayerFromGameOptimistically, playerId),
      moveToLineup: partial(movePlayerFromBenchToLineup, playerId, undefined),
      moveToBench: partial(movePlayerFromLineupToBench, playerId),
      changePosition: partial(changePlayerPosition, playerId),
    }),
    [
      addPlayerToGameOptimistically,
      removePlayerFromGameOptimistically,
      movePlayerFromBenchToLineup,
      movePlayerFromLineupToBench,
      changePlayerPosition,
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

  const selector = useCallback(
    (state: GameStore) => getVisibleRosterPlayers(state, teamRole),
    [teamRole],
  );

  return useGameStore(useShallow(selector));
};

export const useLineup = () => {
  const { teamRole } = useLineupViewContext();
  return useGameStore(state => getVisibleLineupPlayers(state, teamRole));
};

export const useBench = () => {
  const { teamRole } = useLineupViewContext();
  return useGameStore(state => getVisibleBenchPlayers(state, teamRole));
};

export const useLineupStatus = () => {
  const { teamRole } = useLineupViewContext();
  return useGameStore(state => getLineupStatus(state, teamRole));
};

const DEFAULT_SAVE_INTERVAL = 5000;

export const useSaveLineup = (interval = DEFAULT_SAVE_INTERVAL) => {
  const { saveLineup } = useLineupViewContext();

  useEffect(() => {
    const intervalId = setInterval(() => {
      saveLineup();
    }, interval);
    return () => clearInterval(intervalId);
  }, [saveLineup, interval]);
};
