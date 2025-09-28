"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

import { BoxScoreView } from "./box/BoxScoreView";
import { GameView } from "./game/GameView";
import { GameDataProvider } from "./gameData";
import { LineupView } from "./lineup/LineupView";
import { SettingsView } from "./settings/SettingsView";

// import { SetupGuide } from "./SetupGuide";

export function GamePageClient() {
  const { path, gameId } = useParams<{ path?: string[]; gameId: string }>();

  const joinedPath = path?.join("/") ?? "";

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
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      <GameDataProvider gameId={gameId}>{currentView}</GameDataProvider>
      {/* <SetupGuide currentTab={joinedPath} /> */}
    </div>
  );
}
