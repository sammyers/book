"use server";

import { revalidatePath } from "next/cache";

import { createServerClient } from "@/utils/supabase/server";

export async function startGame(gameId: string) {
  const supabase = await createServerClient();

  const { error } = await supabase.from("game").update({ status: "in_progress" }).eq("id", gameId);

  if (!error) {
    const path = `/game/${gameId}`;
    revalidatePath(path);
  }
}
