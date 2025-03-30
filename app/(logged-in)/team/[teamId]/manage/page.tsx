import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

import TeamRoster from "./TeamRoster";

import type { PageProps } from "@/utils/types";

export default async function TeamManagementPage({
  params,
}: PageProps<{ teamId: string }>) {
  const { teamId } = await params;
  const supabase = await createServerClient();

  const { data: team, error } = await supabase
    .from("team")
    .select(
      `
      id,
      name,
      players:player(
        id,
        name,
        jersey_number,
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
