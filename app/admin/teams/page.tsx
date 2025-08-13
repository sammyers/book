import { Alert } from "@heroui/alert";

import { createServerClient } from "@/utils/supabase/server";

import { getTeamsQuery } from "../adminPageQueries";
import TeamManagementView from "./TeamManagementView";

export default async function AdminTeamsPage() {
  const supabase = await createServerClient();

  const { data: teams } = await getTeamsQuery(supabase);

  if (!teams) {
    return <Alert color="danger">Error loading teams data</Alert>;
  }

  return <TeamManagementView initialTeams={teams} />;
}
