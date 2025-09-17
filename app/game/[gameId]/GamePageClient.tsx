"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { BoxScoreView } from "./box/BoxScoreView";
import { GameView } from "./game/GameView";
import { LineupView } from "./lineup/LineupView";
import { SettingsView } from "./settings/SettingsView";

export function GamePageClient() {
  const { path } = useParams<{ path?: string[]; gameId: string }>();

  const joinedPath = path?.join("/") ?? "";

  useEffect(() => {
    console.log("game page client mounted");
  }, []);

  const currentView = useMemo(() => {
    switch (joinedPath) {
      case "lineup":
        return <LineupView />;
      case "game":
        return <GameView />;
      case "settings":
        return <SettingsView />;
      case "box":
        return <BoxScoreView />;
      default:
        return null;
    }
  }, [joinedPath]);

  return (
    <>
      <div className="pt-14 h-full w-full flex flex-col overflow-hidden">{currentView}</div>
    </>
  );
}
