"use client";

import { Button } from "@nextui-org/react";

import { startGame } from "./actions";

import type { Tables } from "@/utils/supabase/database.types";

export default function NotStartedGamePage({ game }: { game: Tables<"game"> }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <p>{game.name} not started</p>
      <Button onClick={() => startGame(game.id)}>Start</Button>
    </div>
  );
}
