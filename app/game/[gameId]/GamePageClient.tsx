"use client";

import { useEffect } from "react";

import type { GamePageGame } from "./queries";

interface Props {
  game: GamePageGame;
}

export function GamePageClient({ game }: Props) {
  useEffect(() => {
    console.log("game page client mounted");
  }, []);

  return (
    <>
      <div className="pt-14">
        {game.name && <p>{game.name}</p>}
        {game.status && <p>{game.status}</p>}
      </div>
    </>
  );
}
