import type { Database } from "@/utils/supabase/database.types";
import type { QueryData, SupabaseClient } from "@supabase/supabase-js";

export const getQuery = (supabase: SupabaseClient<Database>, userId: string) =>
  supabase
    .from("user")
    .select(
      `
      email,
      first_name,
      last_name,
      teams:team(id, name)
    `,
    )
    .eq("id", userId)
    .single();
export type UserMenuData = QueryData<ReturnType<typeof getQuery>>;
