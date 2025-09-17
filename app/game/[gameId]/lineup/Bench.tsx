import { useDroppable } from "@dnd-kit/core";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { cn } from "@heroui/react";
import { ChairIcon } from "@phosphor-icons/react";

import { CardTitle } from "@/components/CardTitle";

import { useBench } from "./context";
import { DraggablePlayerItem } from "./PlayerItem";

export const BENCH_CONTAINER_ID = "bench";

export function Bench() {
  const { setNodeRef } = useDroppable({ id: BENCH_CONTAINER_ID });

  const playerIds = useBench();

  return (
    <Card shadow="sm" ref={setNodeRef}>
      <CardHeader className="flex-col items-stretch">
        <CardTitle className={cn(playerIds.length === 0 && "opacity-50")}>
          <ChairIcon size={24} weight="duotone" />
          <p>Bench</p>
        </CardTitle>
      </CardHeader>
      {playerIds.length > 0 && (
        <CardBody className="flex flex-col gap-2 pt-0">
          {playerIds.map(playerId => (
            <DraggablePlayerItem
              key={playerId}
              playerId={playerId}
              containerId={BENCH_CONTAINER_ID}
            />
          ))}
        </CardBody>
      )}
    </Card>
  );
}
