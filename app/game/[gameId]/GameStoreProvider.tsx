"use client";

import { useRef } from "react";

import { createGameStore, gameStoreContext } from "./_store/store";

import type { GameStoreApi, GameStoreState } from "./_store/store";

interface GameStoreProviderProps {
  initialState: GameStoreState;
  children: React.ReactNode;
}

export function GameStoreProvider({ initialState, children }: GameStoreProviderProps) {
  const gameStoreRef = useRef<GameStoreApi | undefined>(undefined);
  if (!gameStoreRef.current) {
    gameStoreRef.current = createGameStore(initialState);
  }

  return (
    <gameStoreContext.Provider value={gameStoreRef.current}>{children}</gameStoreContext.Provider>
  );
}
