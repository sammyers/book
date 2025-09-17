import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useCallback, useState } from "react";

import { BENCH_CONTAINER_ID } from "./Bench";
import { useLineupViewContext } from "./context";
import { PlayerItem } from "./PlayerItem";
import { TEAM_LINEUP_CONTAINER_ID } from "./TeamLineup";
import { TEAM_ROSTER_CONTAINER_ID } from "./TeamRoster";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { ReactNode } from "react";

export function DndWrapper({ children }: { children: ReactNode }) {
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);
  const {
    addPlayerToGameOptimistically,
    removePlayerFromGameOptimistically,
    movePlayerFromBenchToLineup,
    movePlayerFromLineupToBench,
  } = useLineupViewContext();

  const onDragStart = useCallback((event: DragStartEvent) => {
    setDraggingPlayerId(event.active.id as string);
  }, []);

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setDraggingPlayerId(null);
      if (over?.id === TEAM_LINEUP_CONTAINER_ID) {
        if (active.data.current?.containerId === TEAM_ROSTER_CONTAINER_ID) {
          addPlayerToGameOptimistically(active.id as string, false);
        } else if (active.data.current?.containerId === BENCH_CONTAINER_ID) {
          movePlayerFromBenchToLineup(active.id as string);
        }
      } else if (over?.id === BENCH_CONTAINER_ID) {
        if (active.data.current?.containerId === TEAM_LINEUP_CONTAINER_ID) {
          movePlayerFromLineupToBench(active.id as string);
        } else if (active.data.current?.containerId === TEAM_ROSTER_CONTAINER_ID) {
          addPlayerToGameOptimistically(active.id as string, true);
        }
      } else if (over?.id === TEAM_ROSTER_CONTAINER_ID) {
        removePlayerFromGameOptimistically(active.id as string);
      }
    },
    [
      addPlayerToGameOptimistically,
      movePlayerFromBenchToLineup,
      movePlayerFromLineupToBench,
      removePlayerFromGameOptimistically,
    ],
  );

  return (
    <DndContext autoScroll={false} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <DragOverlay>{draggingPlayerId && <PlayerItem playerId={draggingPlayerId} />}</DragOverlay>
      {children}
    </DndContext>
  );
}
