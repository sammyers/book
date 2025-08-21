import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { HouseIcon } from "@phosphor-icons/react/ssr";
import { redirect } from "next/navigation";

import { HeaderPortal } from "@/components/HeaderPortal";
import { createServerClient } from "@/utils/supabase/server";

import TeamPageTabs from "./TeamPageTabs";

import type { LayoutProps } from "@/utils/types";

export default async function TeamLayout({ params, children }: LayoutProps<{ teamId: string }>) {
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
        <div className="flex flex-col">
          <h1 className="font-bold text-inherit">Manage Team</h1>
          <p className="text-sm text-default-500">{team.name}</p>
        </div>
      </HeaderPortal>
      <div className="flex flex-col w-full max-w-[1024px] h-full">
        <TeamPageTabs teamId={teamId} />
        <div className="flex-1 overflow-y-auto px-4 pt-12 pb-4 -mt-8">{children}</div>
      </div>
    </>
  );
}
