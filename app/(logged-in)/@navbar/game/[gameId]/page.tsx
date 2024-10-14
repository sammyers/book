import { HomeIcon } from "@heroicons/react/24/outline";
import { Button, Link, Navbar } from "@nextui-org/react";

import { Scorebug } from "@/components/Scorebug";

export default async function GameNavbar() {
  return (
    <Navbar>
      <Button isIconOnly variant="light" as={Link} href="/">
        <HomeIcon className="size-6" />
      </Button>
      <Scorebug baseRunners={{ 1: true, 2: false, 3: true }} outs={2} />
    </Navbar>
  );
}
