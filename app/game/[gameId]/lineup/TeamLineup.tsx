import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { cn } from "@heroui/react";
import { BaseballHelmetIcon } from "@phosphor-icons/react";

import { CardTitle } from "@/components/CardTitle";

import { useLineup } from "./context";
import { DraggablePlayerItem } from "./PlayerItem";

export const TEAM_LINEUP_CONTAINER_ID = "team-lineup";

export function TeamLineup() {
  const playerIds = useLineup();

  const { isOver, setNodeRef } = useDroppable({ id: TEAM_LINEUP_CONTAINER_ID });

  return (
    <Card ref={setNodeRef} shadow="sm" className={cn(isOver && "opacity-50")}>
      <CardHeader className="flex-col items-stretch pb-0">
        <CardTitle>
          <BaseballHelmetIcon size={24} weight="duotone" />
          <p>Lineup</p>
        </CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-2">
        <SortableContext items={playerIds}>
          {playerIds.length > 0 ? (
            playerIds.map(playerId => (
              <DraggablePlayerItem
                key={playerId}
                playerId={playerId}
                containerId={TEAM_LINEUP_CONTAINER_ID}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <BaseballHelmetIcon size={48} weight="duotone" className="text-primary-300" />
              <p className="text-default-600">No players in lineup</p>
            </div>
          )}
        </SortableContext>
      </CardBody>
    </Card>
  );
}
