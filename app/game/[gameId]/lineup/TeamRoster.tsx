import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { UsersIcon } from "@phosphor-icons/react";

import { CardTitle } from "@/components/CardTitle";

import { TEAM_ROSTER_CONTAINER_ID } from "../_store/store";
import { useRoster } from "./context";
import { SortablePlayerItem } from "./PlayerItem";

export function TeamRoster() {
  const playerIds = useRoster();

  const { setNodeRef } = useDroppable({ id: TEAM_ROSTER_CONTAINER_ID });

  return (
    <Card shadow="sm" className="sm:grow sm:basis-0 min-h-60" ref={setNodeRef}>
      <CardHeader className="flex-col items-stretch pb-0">
        <CardTitle className="bg-content1">
          <UsersIcon size={24} weight="duotone" />
          <p>Roster</p>
        </CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-2">
        <SortableContext items={playerIds} strategy={rectSortingStrategy}>
          {playerIds.map(playerId => (
            <SortablePlayerItem
              key={playerId}
              playerId={playerId}
              containerId={TEAM_ROSTER_CONTAINER_ID}
            />
          ))}
        </SortableContext>
      </CardBody>
    </Card>
  );
}
