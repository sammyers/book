import type { Database } from "@/utils/supabase/database.types";
import type { QueryData, SupabaseClient } from "@supabase/supabase-js";

export const getPlayerSearchQuery = (
  supabase: SupabaseClient<Database>,
  search: string,
) =>
  supabase
    .from("player")
    .select(
      `
      id,
      name,
      primary_position,
      secondary_position,
      nickname,
      teams:team(id, name)
      `,
    )
    .ilike("name", `%${search}%`);

export type PlayerSearchQueryData = QueryData<
  ReturnType<typeof getPlayerSearchQuery>
>;
export type PlayerSearchResult = PlayerSearchQueryData[number];

export const getTeamRosterQuery = (
  supabase: SupabaseClient<Database>,
  teamId: string,
) =>
  supabase
    .from("player_team")
    .select(
      `
      jersey_number,
      joined_at,
      player(
        id,
        name,
        primary_position,
        secondary_position,
        nickname
      )
      `,
    )
    .eq("team_id", teamId)
    .order("joined_at", { ascending: false });

export type TeamRosterQueryData = QueryData<
  ReturnType<typeof getTeamRosterQuery>
>;
export type TeamRosterPlayer = TeamRosterQueryData[number];
