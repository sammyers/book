import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

import { getNewGamePageQuery } from "../../../queries";
import NewGameForm from "./NewGameForm";

import type { PageProps } from "@/utils/types";

export default async function NewGamePage({
  params,
  searchParams,
}: PageProps<{ teamId: string }, { tournamentId?: string }>) {
  const { teamId } = await params;
  const { tournamentId } = await searchParams;

  if (!teamId) {
    redirect("/");
  }

  const supabase = await createServerClient();

  const { data: team } = await getNewGamePageQuery(supabase, teamId);

  if (!team) {
    redirect("/");
  }

  let tournamentExists = false;
  let latestGameTime: string | undefined;

  if (tournamentId) {
    const { data: tournament } = await supabase
      .from("tournament")
      .select(
        `
        name,
        games:game(
          id,
          name,
          scheduled_start_time
        )
      `,
      )
      .eq("id", tournamentId)
      .order("scheduled_start_time", { ascending: false, referencedTable: "game" })
      .limit(1, { referencedTable: "game" })
      .single();

    tournamentExists = !!tournament;
    latestGameTime = tournament?.games[0]?.scheduled_start_time ?? undefined;
  }

  return (
    <Card shadow="sm" className="mb-32 sm:mb-20">
      <CardHeader className="p-4 pb-0">
        <div className="w-full flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Game</h3>
          <Button
            color="danger"
            variant="flat"
            as={Link}
            href={`/team/${teamId}/games`}
            startContent={<ArrowLeftIcon size={16} weight="duotone" />}
          >
            Back to Games
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-4">
        <NewGameForm
          {...team}
          teamId={teamId}
          tournamentId={tournamentExists ? tournamentId : undefined}
          latestGameTime={latestGameTime}
        />
      </CardBody>
    </Card>
  );
}
