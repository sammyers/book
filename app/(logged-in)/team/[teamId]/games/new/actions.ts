"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

import { newGameFormSchema } from "../../../forms";

import type { FormState } from "@/utils/types";
import type { NewGameFormSchema } from "../../../forms";

export async function createSoloModeTeam(teamName: string, parentTeamId: string) {
  const supabase = await createServerClient();

  const { data: newTeam, error } = await supabase
    .from("team")
    .insert({ name: teamName, associated_team_id: parentTeamId })
    .select()
    .single();

  if (newTeam) {
    revalidatePath(`/team/${parentTeamId}/games/new`);
    return [newTeam.id, error] as const;
  }
  return [null, error] as const;
}

export async function createGame(
  _prevState: FormState | null,
  formData: NewGameFormSchema,
): Promise<FormState> {
  const parsed = newGameFormSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid form data",
      errors: parsed.error.issues.map(issue => ({
        path: issue.path.join("."),
        message: `Server validation: ${issue.message}`,
      })),
    };
  }

  const { name, teamId, opponentTeamId, role } = parsed.data;

  const supabase = await createServerClient();

  const { data: newGame, error } = await supabase.rpc("create_game", {
    game_name: name,
    teams: [
      {
        team_id: teamId,
        role,
      },
      {
        team_id: opponentTeamId,
        role: role === "away" ? "home" : "away",
      },
    ],
  });

  if (!error) {
    redirect(`/game/${newGame.id}`);
  }

  return {
    status: "error",
    message: error.message,
    errors: [],
  };
}
