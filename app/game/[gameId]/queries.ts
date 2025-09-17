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
      game_data
      `,
    )
    .eq("id", gameId)
    .single();

export type GamePageGame = QueryData<ReturnType<typeof getGameQuery>>;

export const getTeamsQuery = (supabase: SupabaseClient<Database>, gameId: string) =>
  supabase
    .from("game_team")
    .select(
      `
      role,
      team (
        id,
        name,
        players:player_team(
          player (
            id,
            name,
            primary_position,
            secondary_position,
            nickname
          ),
          jersey_number
        ),
        game_players:game_roster_player(
          player_id
        ),
        lineup (
          lineup_data
        )
      )
      `,
    )
    .eq("game_id", gameId)
    .eq("team.game_players.game_id", gameId)
    .eq("team.lineup.game_id", gameId)
    .order("player(name)", { referencedTable: "team.player_team", ascending: true });

export type GamePageTeam = QueryData<ReturnType<typeof getTeamsQuery>>[number];
export type TeamRosterPlayer = GamePageTeam["team"]["players"][number];
export type GameRoster = GamePageTeam["team"]["game_players"];
export type GameLineup = GamePageTeam["team"]["lineup"];
