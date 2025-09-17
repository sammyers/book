import { useDroppable } from "@dnd-kit/core";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { cn } from "@heroui/react";
import { UsersIcon } from "@phosphor-icons/react";

import { CardTitle } from "@/components/CardTitle";

import { useRoster } from "./context";
import { DraggablePlayerItem } from "./PlayerItem";

export const TEAM_ROSTER_CONTAINER_ID = "team-roster";

export function TeamRoster() {
  const playerIds = useRoster();

  const { setNodeRef } = useDroppable({ id: TEAM_ROSTER_CONTAINER_ID });

  return (
    <Card shadow="sm" className={cn("sm:grow sm:basis-0 min-h-60")} ref={setNodeRef}>
      <CardHeader className="flex-col items-stretch pb-0">
        <CardTitle>
          <UsersIcon size={24} weight="duotone" />
          <p>Roster</p>
        </CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-2">
        {playerIds.map(playerId => (
          <DraggablePlayerItem
            key={playerId}
            playerId={playerId}
            containerId={TEAM_ROSTER_CONTAINER_ID}
          />
        ))}
      </CardBody>
    </Card>
  );
}
