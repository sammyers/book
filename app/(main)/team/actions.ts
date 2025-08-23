"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlashMessage } from "@/utils/flash";
import { createServerClient } from "@/utils/supabase/server";

import type { FormState } from "@/utils/types";
import type { CreatePlayerFormSchema } from "./forms";

interface NewTeamData {
  name: string;
  playerIds: string[];
}

export async function createTeam(
  _prevState: FormState | null,
  { name, playerIds }: NewTeamData,
): Promise<FormState> {
  const supabase = await createServerClient();

  const { data: newTeam, error } = await supabase.rpc("create_team_with_players", {
    team_name: name,
    player_ids: playerIds,
  });

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

interface AddPlayerToTeamData {
  playerId: string;
  teamId: string;
}

export async function addPlayerToTeam(
  _prevState: FormState | null,
  { playerId, teamId }: AddPlayerToTeamData,
): Promise<FormState> {
  const supabase = await createServerClient();

  const { data: newPlayerTeam, error } = await supabase
    .from("player_team")
    .insert({
      player_id: playerId,
      team_id: teamId,
    })
    .select(
      `
      player:player_id(name),
      team:team_id(name)
    `,
    )
    .single();

  if (!error) {
    return {
      status: "success",
      message: `Player ${newPlayerTeam.player.name} added to ${newPlayerTeam.team.name}`,
    };
  }

  revalidatePath(`/team/${teamId}/roster`);

  return {
    status: "error",
    message: error.message,
    errors: [],
  };
}

export async function createPlayerForTeam(
  _prevState: FormState | null,
  {
    name,
    primaryPosition,
    secondaryPosition,
    jerseyNumber,
    nickname,
    teamId,
  }: CreatePlayerFormSchema,
): Promise<FormState> {
  const supabase = await createServerClient();

  const { data: newPlayer, error } = await supabase
    .from("player")
    .insert({
      name,
      primary_position: primaryPosition,
      secondary_position: secondaryPosition,
      nickname,
    })
    .select()
    .single();

  if (error) {
    return {
      status: "error",
      message: error.message,
      errors: [],
    };
  }

  const { data: newPlayerTeam, error: newPlayerTeamError } = await supabase
    .from("player_team")
    .insert({
      player_id: newPlayer.id,
      team_id: teamId,
      jersey_number: jerseyNumber,
    })
    .select("team:team_id(name)")
    .single();

  if (newPlayerTeamError) {
    return {
      status: "error",
      message: newPlayerTeamError.message,
      errors: [],
    };
  }

  await setFlashMessage({
    title: `Player created`,
    description: `New player ${newPlayer.name} added to ${newPlayerTeam.team.name}`,
    color: "success",
  });

  revalidatePath(`/team/${teamId}/roster`);
  redirect(`/team/${teamId}/roster`);
}
