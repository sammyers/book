"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import type { FormState } from "@/utils/types";

interface NewTeamData {
  name: string;
  playerIds: string[];
}

export async function createTeam(
  _prevState: FormState | null,
  { name, playerIds }: NewTeamData,
): Promise<FormState> {
  const supabase = createClient();

  const { data: newTeam, error } = await supabase.rpc(
    "create_team_with_players",
    { team_name: name, player_ids: playerIds },
  );

  console.log(newTeam, error);

  if (!error) {
    redirect(`/team/${newTeam.id}/manage`);
  }

  return {
    status: "error",
    message: error.message,
    errors: [],
  };
}
