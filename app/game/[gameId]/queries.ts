import type { Database } from "@/utils/supabase/database.types";
import type { QueryData, SupabaseClient } from "@supabase/supabase-js";

export const getGameQuery = (supabase: SupabaseClient<Database>, gameId: string) =>
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

export type GamePageGame = QueryData<ReturnType<typeof getGameQuery>>;
