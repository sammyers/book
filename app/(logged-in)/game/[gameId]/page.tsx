import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import CompletedGamePage from "./CompletedGamePage";
import InProgressGamePage from "./InProgressGamePage";
import NotStartedGamePage from "./NotStartedGamePage";

import type { PageProps } from "@/utils/types";

export default async function GamePage({
  params,
}: PageProps<{ gameId: string }>) {
  const supabase = createClient();

  const { data: game, error } = await supabase
    .from("game")
    .select()
    .eq("id", params.gameId)
    .single();

  if (!game) {
    redirect("/game/new");
  }

  switch (game.status) {
    case "completed":
      return <CompletedGamePage game={game} />;
    case "not_started":
      return <NotStartedGamePage game={game} />;
    case "in_progress":
      return <InProgressGamePage game={game} />;
  }
}
