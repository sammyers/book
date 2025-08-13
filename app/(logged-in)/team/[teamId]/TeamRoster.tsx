import { createServerClient } from "@/utils/supabase/server";

import TeamRosterTable from "./TeamRosterTable";

export default async function TeamRoster({ teamId }: { teamId: string }) {
  const supabase = await createServerClient();

  const { data: team, error } = await supabase
    .from("team")
    .select(
      `
      id,
      players:player(
        id,
        name,
        jersey_number,
        primary_position,
        secondary_position,
        nickname
      )
      `,
    )
    .eq("id", teamId)
    .single();

  if (error || !team) {
    return <div>Error loading team roster</div>;
  }

  return <TeamRosterTable players={team.players} />;
}
