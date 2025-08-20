import type { Database } from "@/utils/supabase/database.types";
import type { QueryData, SupabaseClient } from "@supabase/supabase-js";

export const getTeamsQuery = (supabase: SupabaseClient<Database>) =>
  supabase
    .from("team")
    .select(
      `
      id,
      name,
      admin_note,
      created_at,
      location_city,
      location_state,
      users:user(count)
      `,
    )
    .is("associated_team_id", null)
    .order("created_at", { ascending: false });

export type TeamsQueryData = QueryData<ReturnType<typeof getTeamsQuery>>;
export type Team = TeamsQueryData[number];

export const getUsersQuery = (supabase: SupabaseClient<Database>) =>
  supabase
    .from("user")
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      permission_level,
      joined_at,
      has_set_password,
      is_confirmed,
      memberships:user_team(
        permission_level,
        team(
          name
        )
      )
      `,
    )
    .order("joined_at", { ascending: false });

export type UsersQueryData = QueryData<ReturnType<typeof getUsersQuery>>;
export type User = UsersQueryData[number];

export const getRegionsQuery = (supabase: SupabaseClient<Database>) =>
  supabase.from("region").select("id, name");

export type RegionsQueryData = QueryData<ReturnType<typeof getRegionsQuery>>;
export type Region = RegionsQueryData[number];
