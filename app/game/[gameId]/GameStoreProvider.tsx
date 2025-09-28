"use client";

import { useSearchParams } from "next/navigation";
import { useRef } from "react";

import { createGameStore, GameStoreContext } from "./_store/store";

import type { GameStoreApi } from "./_store/store";
import type { GameStoreState } from "./_store/types";

export type InitialState = Omit<GameStoreState, "lineupViewSelectedTeamRole">;

interface GameStoreProviderProps {
  initialState: InitialState;
  children: React.ReactNode;
}

export function GameStoreProvider({ initialState, children }: GameStoreProviderProps) {
  const searchParams = useSearchParams();

  const primaryTeamId = searchParams.get("teamId");

  const gameStoreRef = useRef<GameStoreApi | undefined>(undefined);
  if (!gameStoreRef.current) {
    gameStoreRef.current = createGameStore({
      ...initialState,
      lineupViewSelectedTeamRole: primaryTeamId === initialState.teams.home.id ? "home" : "away",
    });
  }

  return <GameStoreContext value={gameStoreRef.current}>{children}</GameStoreContext>;
}
