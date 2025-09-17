import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { cn } from "@heroui/react";
import { CalendarDotsIcon, ClockCounterClockwiseIcon, PlayIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { CardTitle } from "@/components/CardTitle";
import { List } from "@/components/List";
import { createServerClient } from "@/utils/supabase/server";

import { getActiveGamesQuery, getPastGamesQuery, getUpcomingGamesQuery } from "../../queries";
import PastGame from "./PastGame";
import UpcomingGame from "./UpcomingGame";

import type { PageProps } from "@/utils/types";

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

  const [activeGamesResponse, upcomingGamesResponse, pastGamesResponse] = await Promise.all([
    getActiveGamesQuery(supabase, teamId),
    getUpcomingGamesQuery(supabase, teamId),
    getPastGamesQuery(supabase, teamId).limit(5),
  ]);

  if (activeGamesResponse.error || upcomingGamesResponse.error || pastGamesResponse.error) {
    return (
      <Alert color="danger" title="Error loading games" className="grow-0">
        <p>
          {activeGamesResponse.error?.message ??
            upcomingGamesResponse.error?.message ??
            pastGamesResponse.error?.message}
        </p>
      </Alert>
    );
  }

  // const activeGames = activeGamesResponse.data;
  const upcomingGames = upcomingGamesResponse.data;
  const pastGames = pastGamesResponse.data;

  return (
    <>
      <div className="flex flex-col gap-6 pb-20">
        <Card shadow="sm">
          <CardHeader className="flex-col items-stretch pb-0">
            <CardTitle>
              <CalendarDotsIcon size={24} weight="duotone" />
              <p>Upcoming Games</p>
            </CardTitle>
          </CardHeader>
          <CardBody>
            {upcomingGames.length > 0 ? (
              <List>
                {upcomingGames.map(game => (
                  <UpcomingGame key={game.game.id} {...game} teamId={teamId} />
                ))}
              </List>
            ) : (
              renderUpcomingGamesEmptyState()
            )}
          </CardBody>
        </Card>
        <Card shadow="sm">
          <CardHeader className="flex-col items-stretch pb-0">
            <CardTitle>
              <ClockCounterClockwiseIcon size={24} weight="duotone" />
              <p>Recent Games</p>
            </CardTitle>
          </CardHeader>
          <CardBody>
            {pastGames.length > 0 ? (
              <List>
                {pastGames.map(game => (
                  <PastGame key={game.game.id} {...game} />
                ))}
              </List>
            ) : (
              renderRecentGamesEmptyState()
            )}
          </CardBody>
        </Card>
      </div>
      {isAtLeastScorekeeper && (
        <Button
          size="lg"
          radius="full"
          color="success"
          variant="flat"
          startContent={<PlayIcon size={24} weight="duotone" />}
          as={Link}
          scroll={false}
          href={`/team/${teamId}/games/new`}
          className={cn([
            "fixed",
            "text-xl",
            "bottom-6",
            "right-6",
            "z-50",
            "shadow-lg",
            "text-medium",
            "bg-success/40",
            "dark:text-success-600",
          ])}
        >
          New Game
        </Button>
      )}
    </>
  );
}
