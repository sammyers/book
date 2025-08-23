import { redirect } from "next/navigation";

import ThemeToggle from "@/components/ThemeToggle";
import { createServerClient } from "@/utils/supabase/server";

import BackButton from "./BackButton";
import { GamePageClient } from "./GamePageClient";
import GamePageNavbar from "./GamePageNavbar";
import { getGameQuery } from "./queries";

export default async function GamePage({ gameId }: { gameId: string }) {
  const supabase = await createServerClient();

  const { data: game } = await getGameQuery(supabase, gameId);

  if (!game) {
    redirect("/game/new");
  }

  return (
    <>
      <div className="relative grow flex flex-col w-full max-w-[1024px] mx-auto">
        <BackButton />
        <ThemeToggle className="absolute top-4 right-2" />
        <GamePageClient game={game} />
      </div>
      <GamePageNavbar gameStatus={game.status} />
    </>
  );
}
