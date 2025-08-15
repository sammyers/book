import { Alert } from "@heroui/alert";

import { createServerClient } from "@/utils/supabase/server";

import { getTeamRosterQuery } from "../../queries";
import TeamRosterClient from "./TeamRosterClient";

import type { PageProps } from "@/utils/types";

export default async function TeamRosterPage({
  params,
}: PageProps<{ teamId: string }>) {
  const { teamId } = await params;

  const supabase = await createServerClient();

  const { data: players, error } = await getTeamRosterQuery(supabase, teamId);

  if (error) {
    return (
      <Alert color="danger" title="Error loading team roster">
        {error?.message}
      </Alert>
    );
  }

  return <TeamRosterClient players={players} teamId={teamId} />;
}
