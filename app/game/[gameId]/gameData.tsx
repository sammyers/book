import { addToast } from "@heroui/toast";
import { createContext, useCallback, useContext, useRef } from "react";

import { createClient } from "@/utils/supabase/browser";

import { getCurrentGameData, getGameDataStatus } from "./_store/selectors";
import { useGameStoreApi } from "./_store/store";

import type { PropsWithChildren } from "react";

const MAX_RETRIES = 3;
const SAVE_DELAY = 1000;

interface Props {
  gameId: string;
}

function useGameDataSaver({ gameId }: Props) {
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deferSaving = useRef(false);
  const retryCount = useRef(0);

  const store = useGameStoreApi();

  const saveGameData = useCallback(
    async ({ errorTitle }: { errorTitle: string }) => {
      const { isDirty, isSaving } = getGameDataStatus(store.getState());

      if (!isDirty) {
        return;
      }

      if (isSaving) {
        // Defer saving until the current save is complete
        deferSaving.current = true;
        return;
      }

      const supabase = createClient();
      const gameData = getCurrentGameData(store.getState());
      // Sets isSaving to true
      const { handleSuccess, handleError } = store.getState().saveGameData(null, true);
      const { error: supabaseError } = await supabase
        .from("game")
        .update({
          game_data: gameData,
        })
        .eq("id", gameId);
      if (supabaseError) {
        handleError(supabaseError);
        addToast({
          title: errorTitle,
          description: supabaseError.message,
          color: "danger",
        });
        retryCount.current++;
        if (retryCount.current < MAX_RETRIES) {
          saveTimeout.current = setTimeout(() => saveGameData({ errorTitle }), SAVE_DELAY);
        }
      } else {
        handleSuccess();
        retryCount.current = 0;
        saveTimeout.current = null;
      }
      if (deferSaving.current) {
        deferSaving.current = false;
        saveTimeout.current = setTimeout(() => saveGameData({ errorTitle }), SAVE_DELAY);
      }
    },
    [store, gameId],
  );

  return useCallback(
    ({ errorTitle }: { errorTitle: string }) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      saveTimeout.current = setTimeout(() => saveGameData({ errorTitle }), SAVE_DELAY);
    },
    [saveGameData],
  );
}

const GameDataSaverContext = createContext<ReturnType<typeof useGameDataSaver> | null>(null);

export function GameDataProvider({ children, gameId }: PropsWithChildren<Props>) {
  const gameDataSaver = useGameDataSaver({ gameId });

  return <GameDataSaverContext value={gameDataSaver}>{children}</GameDataSaverContext>;
}

export function useSaveGameData({ errorTitle }: { errorTitle: string }) {
  const gameDataSaver = useContext(GameDataSaverContext);
  if (!gameDataSaver) {
    throw new Error("GameDataSaverContext not found");
  }
  return useCallback(() => {
    gameDataSaver({ errorTitle });
  }, [gameDataSaver, errorTitle]);
}
