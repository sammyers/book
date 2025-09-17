import { getLocalTimeZone, today } from "@internationalized/date";

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
      teams:team!player_team(id, name)
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
        association,
        start_date,
        end_date,
        location (
          id,
          name,
          city,
          state
        ),
        location_city,
        location_state
      ),
      locations:location (
        id,
        name,
        city,
        state,
        address
      )
    `,
    )
    .eq("id", teamId)
    .gte("tournament.start_date", today(getLocalTimeZone()).toString())
    .single();

export type NewGamePageQuery = QueryData<ReturnType<typeof getNewGamePageQuery>>;
export type NewGamePageOpponent = NewGamePageQuery["opponentTeams"][number];
export type NewGamePageTournament = NewGamePageQuery["tournaments"][number];
export type NewGamePageLocation = NewGamePageQuery["locations"][number];

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

export const getActiveGamesQuery = (supabase: SupabaseClient<Database>, teamId: string) =>
  supabase
    .from("game_team")
    .select(
      `
        role,
        game!inner (
          id,
          name,
          status,
          start_time:scheduled_start_time,
          teams:game_team (
            role,
            team (
              id,
              name
            )
          )
        )
      `,
    )
    .eq("game.status", "in_progress")
    .eq("team_id", teamId);

export type ActiveGamesQuery = QueryData<ReturnType<typeof getActiveGamesQuery>>;
export type ActiveGame = ActiveGamesQuery[number];

export const getUpcomingGamesQuery = (supabase: SupabaseClient<Database>, teamId: string) =>
  supabase
    .from("game_team")
    .select(
      `
      role,
      game!inner (
        id,
        name,
        status,
        start_time:scheduled_start_time,
        tournament (
          name
        ),
        location (
          name,
          city,
          state
        ),
        field,
        teams:game_team (
          role,
          team (
            id,
            name
          )
        )
      )
    `,
    )
    .eq("game.status", "not_started")
    .eq("team_id", teamId)
    .order("game(start_time)", { ascending: true });

export type UpcomingGamesQuery = QueryData<ReturnType<typeof getUpcomingGamesQuery>>;
export type UpcomingGame = UpcomingGamesQuery[number];

export const getPastGamesQuery = (supabase: SupabaseClient<Database>, teamId: string) =>
  supabase
    .from("game_team")
    .select(
      `
      role,
      game!inner (
        id,
        name,
        status,
        started_at,
        ended_at,
        teams:game_team (
          role,
          team (
            id,
            name
          )
        )
      )
    `,
    )
    .eq("game.status", "completed")
    .eq("team_id", teamId)
    .order("scheduled_start_time", { ascending: false, referencedTable: "game" });

export type PastGamesQuery = QueryData<ReturnType<typeof getPastGamesQuery>>;
export type PastGame = PastGamesQuery[number];
