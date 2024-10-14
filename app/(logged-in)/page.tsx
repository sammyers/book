import { Button, Link } from "@nextui-org/react";

export default function LoggedInPage() {
  return (
    <>
      <Button size="lg" color="success" as={Link} href="/game/new">
        Start New Game
      </Button>
    </>
  );
}
