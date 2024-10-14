import { Card, CardBody, CardHeader, Link } from "@nextui-org/react";

import { createClient } from "@/utils/supabase/server";

export default async function GamesPage() {
  const supabase = createClient();

  const { data: games, error } = await supabase.from("game").select();

  if (error) {
    return <div>Could not fetch games</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {games.map((game) => (
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
