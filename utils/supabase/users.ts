import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCurrentUserPermissionLevel(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userData } = await supabase
    .from("user")
    .select("permission_level")
    .eq("id", user.id)
    .single();

  return userData?.permission_level;
}
