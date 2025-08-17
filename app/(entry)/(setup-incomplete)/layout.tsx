import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

import type { ReactNode } from "react";

export default async function SetupIncompleteLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient();

  const { data } = await supabase.auth.getUser();

  // Redirect to home if user is already logged in
  if (data.user) {
    redirect("/");
  }

  return children;
}
