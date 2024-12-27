import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import CompletedGamePage from "./CompletedGamePage";
import InProgressGamePage from "./InProgressGamePage";
import NotStartedGamePage from "./NotStartedGamePage";

import type { SupabaseClient } from "@/utils/supabase/server";
import type { PageProps } from "@/utils/types";
import type { QueryData } from "@supabase/supabase-js";

const getQuery = (supabase: SupabaseClient, gameId: string) =>
  supabase
    .from("game")
    .select(
      `
  id,
  name,
  status,
  game_data,
  teams:game_team (
    role,
    team (
      id,
      name
    )
  )
  `,
    )
    .eq("id", gameId)
    .single();

export type GamePageGame = QueryData<ReturnType<typeof getQuery>>;

export default async function GamePage({
  params,
}: PageProps<{ gameId: string }>) {
  const supabase = createClient();

  const { data: game, error } = await getQuery(supabase, params.gameId);

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
