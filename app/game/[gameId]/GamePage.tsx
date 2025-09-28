import { Alert } from "@heroui/alert";
import { redirect } from "next/navigation";

import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { buildInitialLineup, getLineup } from "@/utils/game/lineups";
import { parseGameData } from "@/utils/game/metadata";
import { createServerClient } from "@/utils/supabase/server";

import { createSaveableState } from "./_store/types";
import BackButton from "./BackButton";
import { GamePageClient } from "./GamePageClient";
import GamePageNavbar from "./GamePageNavbar";
import { GameStoreProvider } from "./GameStoreProvider";
import { getGameQuery, getTeamsQuery } from "./queries";

import type { TeamState } from "./_store/types";
import type { InitialState } from "./GameStoreProvider";
import type { GamePageGame, GamePageTeam, TeamRosterPlayer } from "./queries";

function makeTeamState({ team }: GamePageTeam): TeamState {
  const gamePlayers = new Set(team.game_players.map(player => player.player_id));
  const lineupData = team.lineup.at(0)?.lineup_data;
  let lineup = lineupData ? getLineup(lineupData) : null;
  if (!lineup) {
    const playersInGame = team.players.filter(player => gamePlayers.has(player.player.id));
    lineup = buildInitialLineup(playersInGame.map(p => p.player));
  }

  return {
    id: team.id,
    name: team.name,
    rosterPlayers: team.players.reduce(
      (acc, player) => {
        acc[player.player.id] = player;
        return acc;
      },
      {} as Record<string, TeamRosterPlayer>,
    ),
    pendingPlayerDeletions: {},
    gamePlayers,
    pendingPlayerAdditions: new Set(),
    lineup: {
      ...createSaveableState(lineup),
      preventSaving: false,
    },
  };
}

function makeInitialState(game: GamePageGame, teams: GamePageTeam[]): InitialState {
  const homeTeam = teams.find(team => team.role === "home");
  const awayTeam = teams.find(team => team.role === "away");
  if (!homeTeam || !awayTeam) {
    throw new Error("Game must have both home and away teams");
  }

  const gameData = parseGameData(game.game_data);

  return {
    teams: {
      home: makeTeamState(homeTeam),
      away: makeTeamState(awayTeam),
    },
    dragging: {
      activePlayerId: null,
      originContainer: null,
      overContainer: null,
    },
    gameData: createSaveableState(gameData),
  };
}

export default async function GamePage({ gameId }: { gameId: string }) {
  const supabase = await createServerClient();

  const { data: game } = await getGameQuery(supabase, gameId);

  if (!game) {
    redirect("/game/new");
  }

  const { data: rosters, error: rostersError } = await getTeamsQuery(supabase, gameId);

  if (rostersError) {
    return (
      <Alert color="danger" title="Error loading rosters">
        {rostersError.message}
      </Alert>
    );
  }

  let initialState: InitialState;
  try {
    initialState = makeInitialState(game, rosters);
  } catch (error) {
    return (
      <div className="p-6">
        <Alert color="danger" title="Error parsing game data">
          {error instanceof Error ? error.message : "Unknown error"}
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex flex-col w-full h-full max-w-[1024px] mx-auto">
        <BackButton />
        <ThemeToggleButton className="absolute top-2 right-2 z-20 bg-content1" />
        <GameStoreProvider initialState={initialState}>
          <GamePageClient />
        </GameStoreProvider>
      </div>
      <GamePageNavbar gameStatus={game.status} />
    </>
  );
}
