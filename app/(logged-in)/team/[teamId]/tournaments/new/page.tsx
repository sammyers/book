import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

import { getLocationsQuery } from "../../../queries";
import NewTournamentForm from "./NewTournamentForm";

import type { PageProps } from "@/utils/types";

export default async function NewTournamentPage({
  params,
  searchParams,
}: PageProps<{ teamId: string }, { from: string | undefined }>) {
  const { teamId } = await params;

  if (!teamId) {
    redirect("/");
  }

  const supabase = await createServerClient();

  const { data: team } = await supabase
    .from("team")
    .select("primary_region_id")
    .eq("id", teamId)
    .single();

  if (!team) {
    redirect("/");
  }

  const { data: locations } = await getLocationsQuery(supabase, teamId);

  const fromNewGame = (await searchParams).from === "new-game";

  return (
    <Card shadow="sm" className="mb-19">
      <CardHeader className="p-4 pb-0">
        <div className="w-full flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Tournament</h3>
          <Button
            color="danger"
            variant="flat"
            as={Link}
            scroll={false}
            href={fromNewGame ? `/team/${teamId}/games/new` : `/team/${teamId}/tournaments`}
            startContent={<ArrowLeftIcon size={16} weight="duotone" />}
          >
            {fromNewGame ? "Back" : "Back to Games"}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-4">
        <NewTournamentForm
          teamId={teamId}
          fromNewGame={fromNewGame}
          regionId={team.primary_region_id ?? undefined}
          locations={locations ?? []}
        />
      </CardBody>
    </Card>
  );
}
