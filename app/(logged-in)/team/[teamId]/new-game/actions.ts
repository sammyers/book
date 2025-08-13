"use server";

import { revalidatePath } from "next/cache";

import { createServerClient } from "@/utils/supabase/server";

export async function createSoloModeTeam(
  teamName: string,
  parentTeamId: string,
) {
  const supabase = await createServerClient();

  const { data: newTeam, error } = await supabase
    .from("team")
    .insert({ name: teamName, associated_team_id: parentTeamId })
    .select()
    .single();

  if (newTeam) {
    revalidatePath(`/game/new`);
    return [newTeam.id, error] as const;
  }
  return [null, error] as const;
}
