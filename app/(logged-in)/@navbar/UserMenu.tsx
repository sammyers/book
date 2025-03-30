import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

import UserMenuClient from "./UserMenuClient";
import { getQuery } from "./userMenuQuery";

export default async function UserMenu() {
  const supabase = await createServerClient();

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
