import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import UserMenuClient from "./UserMenuClient";

import type { SupabaseClient } from "@/utils/supabase/server";
import type { QueryData } from "@supabase/supabase-js";

const getQuery = (supabase: SupabaseClient, userId: string) =>
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

export default async function UserMenu() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: userData } = await getQuery(supabase, user.id);

  if (!userData) {
    redirect("/");
  }

  return <UserMenuClient user={userData} />;
}
