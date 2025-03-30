"use client";

import { Button } from "@heroui/button";

import { startGame } from "./actions";

import type { GamePageGame } from "./gamePageQuery";

export default function NotStartedGamePage({ game }: { game: GamePageGame }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <p>{game.name} not started</p>
      <Button onPress={() => startGame(game.id)}>Start</Button>
    </div>
  );
}
