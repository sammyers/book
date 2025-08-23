import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";

import { createServerClient } from "@/utils/supabase/server";

export default async function GamesPage() {
  const supabase = await createServerClient();

  const { data: games, error } = await supabase.from("game").select();

  if (error) {
    return <div>Could not fetch games</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {games.map(game => (
        <Card as={Link} key={game.id} isPressable href={`/game/${game.id}`}>
          <CardHeader>
            <h5>{game.name}</h5>
          </CardHeader>
          <CardBody>
            <p>{game.status}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
