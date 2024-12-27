import type { GamePageGame } from "./page";

export default function CompletedGamePage({ game }: { game: GamePageGame }) {
  return <div>{game.name} complete</div>;
}
