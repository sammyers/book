import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  BaseballHelmetIcon,
  HouseIcon,
  TrophyIcon,
} from "@phosphor-icons/react/ssr";
import { redirect } from "next/navigation";

import { HeaderPortal } from "@/components/HeaderPortal";
import { createServerClient } from "@/utils/supabase/server";

import TeamGames from "./TeamGames";
import TeamPageTabs from "./TeamPageTabs";
import TeamRoster from "./TeamRoster";

import type { PageProps } from "@/utils/types";

export default async function TeamManagementPage({
  params,
}: PageProps<{ teamId: string }>) {
  const { teamId } = await params;
  const supabase = await createServerClient();

  const { data: team } = await supabase
    .from("team")
    .select(
      `
      id,
      name
      `,
    )
    .eq("id", teamId)
    .single();

  if (!team) {
    redirect("/");
  }

  return (
    <>
      <HeaderPortal>
        <Button isIconOnly variant="light" as={Link} href="/">
          <HouseIcon size={24} />
        </Button>
        <h1 className="font-bold text-inherit">
          Team: <span className="text-primary">{team.name}</span>
        </h1>
      </HeaderPortal>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="flat"
            color="success"
            startContent={<BaseballHelmetIcon weight="duotone" size={20} />}
            as={Link}
            href={`/team/${team.id}/new-game`}
          >
            New Game
          </Button>
          <Button
            variant="flat"
            color="success"
            startContent={<TrophyIcon weight="duotone" size={20} />}
            as={Link}
            href={`/tournament/new?teamId=${team.id}`}
          >
            New Tournament
          </Button>
        </div>
        <TeamPageTabs
          roster={<TeamRoster teamId={teamId} />}
          games={<TeamGames teamId={teamId} />}
        />
      </div>
    </>
  );
}
