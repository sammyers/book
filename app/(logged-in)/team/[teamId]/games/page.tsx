import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  BaseballHelmetIcon,
  CalendarDotsIcon,
  ClockCounterClockwiseIcon,
  TrophyIcon,
} from "@phosphor-icons/react/ssr";
import { startCase } from "lodash";
import Link from "next/link";

import { List, ListItem } from "@/components/List";
import { getOpponentPrefix } from "@/utils/display";
import { createServerClient } from "@/utils/supabase/server";

import type { Enums, Tables } from "@/utils/supabase/database.types";
import type { PageProps } from "@/utils/types";

type TeamGame = {
  role: Enums<"team_role">;
  game: {
    teams: Array<{
      role: Enums<"team_role">;
      team: Pick<Tables<"team">, "id" | "name">;
    }>;
  };
};

const getOpponentTeam = ({ role, game: { teams } }: TeamGame) => {
  const opponentTeam = teams.find(t => t.role !== role);
  return opponentTeam ? opponentTeam.team : null;
};

const renderUpcomingGamesEmptyState = () => (
  <div className="flex flex-col items-center gap-4 py-8">
    <div className="flex flex-col items-center gap-2">
      <CalendarDotsIcon size={48} weight="duotone" className="text-primary-300" />
      <p className="text-default-600">No upcoming games</p>
    </div>
  </div>
);

const renderRecentGamesEmptyState = () => (
  <div className="flex flex-col items-center gap-4 py-8">
    <div className="flex flex-col items-center gap-2">
      <ClockCounterClockwiseIcon size={48} weight="duotone" className="text-primary-300" />
      <p className="text-default-600">No recent games</p>
    </div>
  </div>
);

export default async function TeamGamesPage({ params }: PageProps<{ teamId: string }>) {
  const { teamId } = await params;

  const supabase = await createServerClient();

  const { data: isAtLeastScorekeeper } = await supabase.rpc("has_team_permission", {
    permission: "scorekeeper",
    team_id: teamId,
  });

  const [upcomingGamesResponse, pastGamesResponse] = await Promise.all([
    supabase
      .from("game_team")
      .select(
        `
        role,
        game (
          id,
          name,
          status,
          start_time:scheduled_start_time,
          teams:game_team (
            role,
            team (
              id,
              name
            )
          )
        )
      `,
      )
      .eq("game.status", "not_started")
      .eq("team_id", teamId),
    supabase
      .from("game_team")
      .select(
        `
        role,
        game (
          id,
          name,
          status,
          started_at,
          ended_at,
          teams:game_team (
            role,
            team (
              id,
              name
            )
          )
        )
      `,
      )
      .neq("game.status", "not_started")
      .eq("team_id", teamId)
      .limit(5),
  ]);

  if (upcomingGamesResponse.error || pastGamesResponse.error) {
    return <div>Error loading games</div>;
  }

  const upcomingGames = upcomingGamesResponse.data;
  const pastGames = pastGamesResponse.data;

  return (
    <div className="flex flex-col gap-4">
      {isAtLeastScorekeeper && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="flat"
            color="success"
            startContent={<BaseballHelmetIcon weight="duotone" size={20} />}
            as={Link}
            href={`/team/${teamId}/games/new`}
          >
            New Game
          </Button>
          <Button
            variant="flat"
            color="success"
            startContent={<TrophyIcon weight="duotone" size={20} />}
            as={Link}
            href={`/team/${teamId}/tournaments/new`}
          >
            New Tournament
          </Button>
        </div>
      )}
      <Card>
        <CardHeader className="flex-col items-stretch">
          <div className="rounded-md bg-default-100 text-foreground-500 p-2 flex gap-2 items-center">
            <CalendarDotsIcon size={24} weight="duotone" />
            <span className="font-medium">Upcoming Games</span>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {upcomingGames.length > 0 ? (
            <List>
              {upcomingGames.map(teamGame => (
                <ListItem key={teamGame.game.id} className="flex flex-col gap-1 items-start">
                  <h3 className="font-bold">
                    {getOpponentPrefix(teamGame.role)} {getOpponentTeam(teamGame)?.name}
                  </h3>
                  <h5 className="font-semibold uppercase text-small text-foreground-600">
                    {teamGame.game.name}
                  </h5>
                  <p className="text-foreground-500 text-small">{startCase(teamGame.role)}</p>
                </ListItem>
              ))}
            </List>
          ) : (
            renderUpcomingGamesEmptyState()
          )}
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="flex-col items-stretch">
          <div className="rounded-md bg-default-100 text-foreground-500 p-2 flex gap-2 items-center">
            <ClockCounterClockwiseIcon size={24} weight="duotone" />
            <span className="font-medium">Recent Games</span>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {pastGames.length > 0 ? (
            <List>
              {pastGames.map(teamGame => (
                <ListItem key={teamGame.game.id} className="flex flex-col gap-1 items-start">
                  <h3 className="font-bold">
                    {getOpponentPrefix(teamGame.role)} {getOpponentTeam(teamGame)?.name}
                  </h3>
                  <h5 className="font-semibold uppercase text-small text-foreground-600">
                    {teamGame.game.name}
                  </h5>
                  <p className="text-foreground-500 text-small">{startCase(teamGame.role)}</p>
                </ListItem>
              ))}
            </List>
          ) : (
            renderRecentGamesEmptyState()
          )}
        </CardBody>
      </Card>
    </div>
  );
}
