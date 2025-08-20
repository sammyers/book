"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlashMessage } from "@/utils/flash";
import { createServerClient } from "@/utils/supabase/server";

import type { FormState } from "@/utils/types";
import type { NewLocationFormSchema, NewTournamentActionData } from "../../../forms";

export async function createLocation(formData: NewLocationFormSchema, teamId: string) {
  const supabase = await createServerClient();

  const { data: newLocation, error } = await supabase
    .from("location")
    .insert({
      ...formData,
      created_by_team_id: teamId,
    })
    .select()
    .single();

  if (newLocation) {
    revalidatePath(`/team/${teamId}/tournaments/new`);
    return [newLocation.id, error] as const;
  }

  return [null, error] as const;
}

export async function createTournament(
  _prevState: FormState | null,
  formData: NewTournamentActionData,
): Promise<FormState> {
  const supabase = await createServerClient();

  const locationData =
    formData.location.type === "single_location"
      ? {
          location_id: formData.location.locationId,
        }
      : {
          location_city: formData.location.city,
          location_state: formData.location.state,
        };

  const { data: newTournament, error } = await supabase.rpc("create_tournament_for_team", {
    team_id: formData.teamId,
    tournament_name: formData.name,
    region_id: formData.regionId,
    start_date: formData.dateRange.start,
    end_date: formData.dateRange.end,
    ...locationData,
  });

  if (error) {
    return {
      status: "error",
      message: error?.message,
      errors: [],
    };
  }

  let description;
  if (formData.dateRange.start === formData.dateRange.end) {
    description = `Tournament ${newTournament.name} created for ${formData.dateRange.start.toString()}`;
  } else {
    description = `Tournament ${newTournament.name} created for ${formData.dateRange.start.toString()} to ${formData.dateRange.end.toString()}`;
  }
  await setFlashMessage({
    title: "Tournament created",
    description,
    color: "success",
  });

  revalidatePath(`/team/${formData.teamId}/tournaments`);
  revalidatePath(`/team/${formData.teamId}/games/new`);

  if (formData.redirectToNewGame) {
    redirect(`/team/${formData.teamId}/games/new?tournamentId=${newTournament.id}`);
  } else {
    redirect(`/team/${formData.teamId}/tournaments`);
  }
}
