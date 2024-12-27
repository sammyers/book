import { Button, Link } from "@nextui-org/react";
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
      <div className="flex justify-between items-center">
        <h1 className="text-lg">
          Manage Team: <span className="text-secondary">{team.name}</span>
        </h1>
        <Button as={Link} href={`/game/new?teamId=${team.id}`}>
          New Game
        </Button>
      </div>
      <TeamRoster players={team.players} />
    </div>
  );
}
