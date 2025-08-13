import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

import NewGameForm from "./NewGameForm";

import type { PageProps } from "@/utils/types";

export default async function NewGamePage({
  params,
}: PageProps<{ teamId: string }>) {
  const { teamId } = await params;

  if (!teamId) {
    redirect("/");
  }

  const supabase = await createServerClient();

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
    <Card>
      <CardHeader>
        <h2 className="text-center">New Game for {team.name}</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <NewGameForm teams={teams} teamId={teamId} />
      </CardBody>
    </Card>
  );
}
