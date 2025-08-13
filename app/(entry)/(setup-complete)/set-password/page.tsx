import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

import SetPasswordForm from "./SetPasswordForm";

export default async function SetPasswordPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userData } = await supabase
    .from("user")
    .select("has_set_password, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (userData?.has_set_password) {
    redirect("/");
  }

  const userName =
    `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() ||
    "User";

  return <SetPasswordForm userName={userName} />;
}
