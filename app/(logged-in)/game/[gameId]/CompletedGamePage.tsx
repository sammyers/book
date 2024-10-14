import type { Tables } from "@/utils/supabase/database.types";

export default function CompletedGamePage({ game }: { game: Tables<"game"> }) {
  return <div>{game.name} complete</div>;
}
