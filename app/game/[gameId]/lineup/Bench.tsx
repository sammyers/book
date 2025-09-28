import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { cn } from "@heroui/react";
import { ChairIcon } from "@phosphor-icons/react";

import { CardTitle } from "@/components/CardTitle";

import { BENCH_CONTAINER_ID } from "../_store/types";
import { useBench } from "./context";
import { SortablePlayerItem } from "./PlayerItem";

export function Bench() {
  const { setNodeRef } = useDroppable({ id: BENCH_CONTAINER_ID });

  const playerIds = useBench();

  return (
    <Card shadow="sm" ref={setNodeRef}>
      <CardHeader className="flex-col items-stretch">
        <CardTitle className={cn("bg-content1", playerIds.length === 0 && "opacity-50")}>
          <ChairIcon size={24} weight="duotone" />
          <p>Bench</p>
        </CardTitle>
      </CardHeader>
      {playerIds.length > 0 && (
        <CardBody className="flex flex-col gap-2 pt-0">
          <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
            {playerIds.map(playerId => (
              <SortablePlayerItem
                key={playerId}
                playerId={playerId}
                containerId={BENCH_CONTAINER_ID}
              />
            ))}
          </SortableContext>
        </CardBody>
      )}
    </Card>
  );
}
