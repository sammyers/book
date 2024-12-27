"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import { newGameFormSchema } from "./new/formSchema";

import type { FormState } from "@/utils/types";
import type { NewGameFormSchema } from "./new/formSchema";

export async function createGame(
  _prevState: FormState | null,
  formData: NewGameFormSchema,
): Promise<FormState> {
  const parsed = newGameFormSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid form data",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: `Server validation: ${issue.message}`,
      })),
    };
  }

  const { name, teamId, opponentTeamId, role } = parsed.data;

  const supabase = createClient();

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
