import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

import CompletedGamePage from "./CompletedGamePage";
import { getQuery } from "./gamePageQuery";
import InProgressGamePage from "./InProgressGamePage";
import NotStartedGamePage from "./NotStartedGamePage";

import type { PageProps } from "@/utils/types";

export default async function GamePage({
  params,
}: PageProps<{ gameId: string }>) {
  const { gameId } = await params;
  const supabase = await createServerClient();

  const { data: game, error } = await getQuery(supabase, gameId);

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
