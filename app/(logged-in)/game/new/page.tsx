import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import NewGameForm from "./NewGameForm";

import type { PageProps } from "@/utils/types";

export default async function NewGamePage({
  searchParams,
}: PageProps<never, { teamId?: string }>) {
  const { teamId } = searchParams;

  if (!teamId) {
    redirect("/");
  }

  const supabase = createClient();

  const { data: team } = await supabase
    .from("team")
    .select(
      `
    id,
    name,
    players:player (
      id,
      name,
      primary_position,
      secondary_position
    )
    `,
    )
    .eq("id", teamId)
    .single();

  if (!team) {
    redirect("/");
  }

  const { data: teams, error } = await supabase
    .from("team")
    .select()
    .eq("associated_team_id", teamId);

  if (error) {
    return <div></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center">Set up a new game for {team.name}</h2>
      <NewGameForm teams={teams} teamId={teamId} />
    </div>
  );
}
