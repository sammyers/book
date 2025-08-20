import type { Database } from "@/utils/supabase/database.types";
import type { QueryData, SupabaseClient } from "@supabase/supabase-js";

export const getPlayerSearchQuery = (supabase: SupabaseClient<Database>, search: string) =>
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
    .or(`name.ilike.%${search}%,nickname.ilike.%${search}%`);

export type PlayerSearchQueryData = QueryData<ReturnType<typeof getPlayerSearchQuery>>;
export type PlayerSearchResult = PlayerSearchQueryData[number];

export const getTeamRosterQuery = (supabase: SupabaseClient<Database>, teamId: string) =>
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

export type TeamRosterQueryData = QueryData<ReturnType<typeof getTeamRosterQuery>>;
export type TeamRosterPlayer = TeamRosterQueryData[number];

export const getNewGamePageQuery = (supabase: SupabaseClient<Database>, teamId: string) =>
  supabase
    .from("team")
    .select(
      `
      id,
      opponentTeams:team(
        id,
        name
      ),
      tournaments:tournament(
        id,
        name,
        start_date,
        end_date,
        location (
          name,
          city,
          state
        ),
        location_city,
        location_state
      )
    `,
    )
    .eq("id", teamId)
    .single();

export type NewGamePageQuery = QueryData<ReturnType<typeof getNewGamePageQuery>>;
export type NewGamePageOpponent = NewGamePageQuery["opponentTeams"][number];
export type NewGamePageTournament = NewGamePageQuery["tournaments"][number];

export const getLocationsQuery = (supabase: SupabaseClient<Database>, teamId: string) =>
  supabase
    .from("location")
    .select(
      `
      id,
      name,
      city,
      state,
      address
    `,
    )
    .eq("created_by_team_id", teamId);

export type LocationsQuery = QueryData<ReturnType<typeof getLocationsQuery>>;
export type Location = LocationsQuery[number];
