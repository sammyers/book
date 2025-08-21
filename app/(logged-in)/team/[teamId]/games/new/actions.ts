"use server";

import { DateTime } from "luxon";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlashMessage } from "@/utils/flash";
import { createServerClient } from "@/utils/supabase/server";

import type { FormState } from "@/utils/types";
import type { NewGameFormActionData } from "../../../forms";

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

export async function createTournamentGame(
  _prevState: FormState | null,
  formData: NewGameFormActionData,
): Promise<FormState> {
  const supabase = await createServerClient();

  const { data: newGame, error } = await supabase.rpc("create_tournament_game_for_team", {
    game_name: formData.name ?? "",
    tournament_id: formData.tournamentId,
    creator_team_id: formData.teamId,
    creator_team_role: formData.role,
    opponent_team_id: formData.opponentTeamId,
    scheduled_start_time: formData.scheduledStartTime,
    location_id: formData.locationId,
    field_name: formData.fieldName,
    game_data: {
      trackOpponentAtBats: formData.trackOpponentAtBats,
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
      errors: [],
    };
  }

  await setFlashMessage({
    title: "Game created",
    description: `Game created for ${DateTime.fromISO(newGame.scheduled_start_time!).toLocaleString(DateTime.TIME_SIMPLE)}`,
    color: "success",
  });

  if (formData.createAnotherGame) {
    revalidatePath(`/team/${formData.teamId}/games/new`);
    redirect(`/team/${formData.teamId}/games/new?tournamentId=${formData.tournamentId}`);
  }

  redirect(`/game/${newGame.id}?teamId=${formData.teamId}`);
}
