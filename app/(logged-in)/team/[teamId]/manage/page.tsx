import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import TeamRoster from "./TeamRoster";

import type { PageProps } from "@/utils/types";

export default async function TeamManagementPage({
  params: { teamId },
}: PageProps<{ teamId: string }>) {
  const supabase = createClient();

  const { data: team, error } = await supabase
    .from("team")
    .select(
      `
      id,
      name,
      players:player(
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

  return (
    <div className="flex flex-col gap-4">
      <h2>Team Name: {team.name}</h2>
      <TeamRoster players={team.players} />
    </div>
  );
}
