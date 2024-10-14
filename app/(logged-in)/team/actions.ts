"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function createTeam(name: string, playerIds: string[]) {
  const supabase = createClient();

  const { data: newTeam, error } = await supabase.rpc(
    "create_team_with_players",
    { team_name: name, player_ids: playerIds },
  );

  console.log(newTeam, error);

  if (!error) {
    redirect(`/team/${newTeam.id}/manage`);
  }
}
