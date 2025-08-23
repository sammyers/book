import type { Enums, Tables } from "@/utils/supabase/database.types";

export type TeamGame = {
  role: Enums<"team_role">;
  game: {
    teams: Array<{
      role: Enums<"team_role">;
      team: Pick<Tables<"team">, "id" | "name">;
    }>;
  };
};

export const getOpponentTeam = ({ role, game: { teams } }: TeamGame) => {
  const opponentTeam = teams.find(t => t.role !== role);
  return opponentTeam ? opponentTeam.team : null;
};
