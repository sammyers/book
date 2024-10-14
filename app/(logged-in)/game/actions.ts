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

  const { name, awayTeamId, homeTeamId } = parsed.data;

  const supabase = createClient();

  const { data, error } = await supabase
    .from("game")
    .insert({ name, away_team_id: awayTeamId, home_team_id: homeTeamId })
    .select();

  if (!error) {
    const [{ id }] = data;
    redirect(`/game/${id}`);
  }

  return {
    status: "error",
    message: error.message,
    errors: [],
  };
}
