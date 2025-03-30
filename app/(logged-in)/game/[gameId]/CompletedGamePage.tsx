import type { GamePageGame } from "./gamePageQuery";

export default function CompletedGamePage({ game }: { game: GamePageGame }) {
  return <div>{game.name} complete</div>;
}
