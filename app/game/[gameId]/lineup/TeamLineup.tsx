import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { BaseballHelmetIcon } from "@phosphor-icons/react";

import { CardTitle } from "@/components/CardTitle";

import { TEAM_LINEUP_CONTAINER_ID } from "../_store/store";
import { useLineup, useSaveLineup } from "./context";
import { LineupStatus } from "./LineupStatus";
import { SortablePlayerItem } from "./PlayerItem";

export function TeamLineup() {
  const playerIds = useLineup();

  const { setNodeRef } = useDroppable({ id: TEAM_LINEUP_CONTAINER_ID });

  useSaveLineup();

  return (
    <Card ref={setNodeRef} shadow="sm">
      <CardHeader className="flex-col items-stretch pb-0">
        <CardTitle className="bg-content1 justify-between items-center">
          <div className="flex items-center gap-2">
            <BaseballHelmetIcon size={24} weight="duotone" />
            <p>Lineup</p>
          </div>
          <LineupStatus />
        </CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-2">
        <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
          {playerIds.length > 0 ? (
            playerIds.map(playerId => (
              <SortablePlayerItem
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
