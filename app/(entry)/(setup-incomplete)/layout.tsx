import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import type { ReactNode } from "react";

export default async function SetupIncompleteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/");
  }

  return children;
}
