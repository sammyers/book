import {
  closestCenter,
  DndContext,
  DragOverlay,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import { useCallback, useId } from "react";

import {
  getActiveDraggingPlayer,
  getDraggingOriginContainer,
  getDraggingOverContainer,
  getPlayerOriginContainer,
  getVisiblePlayerIds,
} from "../_store/selectors";
import {
  BENCH_CONTAINER_ID,
  TEAM_LINEUP_CONTAINER_ID,
  TEAM_ROSTER_CONTAINER_ID,
  useGameStore,
  useGameStoreApi,
} from "../_store/store";
import { useLineupViewContext } from "./context";
import { PlayerItem } from "./PlayerItem";

import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import type { ReactNode } from "react";
import type { ContainerId } from "../_store/store";

export function DndWrapper({ children }: { children: ReactNode }) {
  const {
    teamRole,
    addPlayerToGameOptimistically,
    removePlayerFromGameOptimistically,
    movePlayerFromBenchToLineup,
    movePlayerFromLineupToBench,
    changePlayerBattingOrder,
    getPlayerLineupIndex,
  } = useLineupViewContext();

  const store = useGameStoreApi();

  const draggingPlayerId = useGameStore(getActiveDraggingPlayer);

  const startDraggingPlayer = useGameStore(state => state.startDraggingPlayer);
  const updateDraggingPlayer = useGameStore(state => state.updateDraggingPlayer);
  const stopDraggingPlayer = useGameStore(state => state.stopDraggingPlayer);

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const playerId = event.active.id as string;
      const containerId = event.active.data.current?.containerId as ContainerId;
      startDraggingPlayer({ playerId, containerId });
    },
    [startDraggingPlayer],
  );

  const onDragOver = useCallback(
    ({ over }: DragOverEvent) => {
      if (!over) {
        return;
      }
      const targetId = over.id as string;
      const targetContainerId = over.data.current?.containerId as ContainerId | undefined;

      // If no container id, target must be a container
      const overContainer = targetContainerId ?? (targetId as ContainerId);

      updateDraggingPlayer({ overContainer });
    },
    [updateDraggingPlayer],
  );

  const onDragCancel = useCallback(() => {
    stopDraggingPlayer();
  }, [stopDraggingPlayer]);

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      console.log("onDragEnd", active, over);
      if (over) {
        const draggingPlayerId = active.id as string;
        const originContainerId = getDraggingOriginContainer(store.getState());
        // Could be a player or a container
        const targetId = over.id as string;
        const targetContainerId = getDraggingOverContainer(store.getState());

        // Dragging from lineup
        if (originContainerId === TEAM_LINEUP_CONTAINER_ID) {
          console.log("dragging from lineup", { draggingPlayerId, targetId, targetContainerId });
          if (targetId === draggingPlayerId || targetId === TEAM_LINEUP_CONTAINER_ID) {
            return;
          }
          if (targetContainerId === TEAM_LINEUP_CONTAINER_ID) {
            const targetLineupIndex = getPlayerLineupIndex(targetId);
            changePlayerBattingOrder(draggingPlayerId, targetLineupIndex);
          }
          if (targetId === BENCH_CONTAINER_ID) {
            movePlayerFromLineupToBench(draggingPlayerId);
          }
          if (targetId === TEAM_ROSTER_CONTAINER_ID) {
            removePlayerFromGameOptimistically(draggingPlayerId);
          }
        }

        // Dragging from roster
        if (originContainerId === TEAM_ROSTER_CONTAINER_ID) {
          if (targetContainerId === TEAM_LINEUP_CONTAINER_ID) {
            const targetLineupIndex = getPlayerLineupIndex(targetId);
            addPlayerToGameOptimistically(draggingPlayerId, false, targetLineupIndex);
          }
          if (targetId === TEAM_LINEUP_CONTAINER_ID) {
            addPlayerToGameOptimistically(draggingPlayerId, false);
          }
          if (targetId === BENCH_CONTAINER_ID) {
            addPlayerToGameOptimistically(draggingPlayerId, true);
          }
        }

        // Dragging from bench
        if (originContainerId === BENCH_CONTAINER_ID) {
          if (targetContainerId === TEAM_LINEUP_CONTAINER_ID) {
            const targetLineupIndex = getPlayerLineupIndex(targetId);
            movePlayerFromBenchToLineup(draggingPlayerId, targetLineupIndex);
          }
          if (targetId === TEAM_LINEUP_CONTAINER_ID) {
            movePlayerFromBenchToLineup(draggingPlayerId);
          }
          if (targetId === TEAM_ROSTER_CONTAINER_ID) {
            removePlayerFromGameOptimistically(draggingPlayerId);
          }
        }
      }
      stopDraggingPlayer();
    },
    [
      addPlayerToGameOptimistically,
      movePlayerFromBenchToLineup,
      movePlayerFromLineupToBench,
      removePlayerFromGameOptimistically,
      getPlayerLineupIndex,
      changePlayerBattingOrder,
      stopDraggingPlayer,
      store,
    ],
  );

  const collisionDetection: CollisionDetection = useCallback(
    args => {
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      const collision = getFirstCollision(intersections);
      let overId = collision?.id ?? null;

      if (overId !== null) {
        if (overId === TEAM_LINEUP_CONTAINER_ID) {
          const containerItems = getVisiblePlayerIds(
            store.getState(),
            teamRole,
            overId as ContainerId,
          );

          if (containerItems.length > 0) {
            // Return the closest droppable within the lineup container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                container =>
                  container.id !== overId && containerItems.includes(container.id as string),
              ),
            })[0]?.id;
          }
        } else {
          const overData = collision?.data?.droppableContainer.data.current;
          const originContainerId = getPlayerOriginContainer(
            store.getState(),
            teamRole,
            overId as string,
          );
          // Don't allow re-ordering items within the roster or bench
          if (
            originContainerId === overData?.containerId &&
            (originContainerId === TEAM_ROSTER_CONTAINER_ID ||
              originContainerId === BENCH_CONTAINER_ID)
          ) {
            return [];
          }
        }

        return [{ id: overId }];
      }

      return [];
    },
    [teamRole, store],
  );

  const id = useId();

  return (
    <DndContext
      id={id}
      autoScroll={false}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      collisionDetection={collisionDetection}
    >
      <DragOverlay>{draggingPlayerId && <PlayerItem playerId={draggingPlayerId} />}</DragOverlay>
      {children}
    </DndContext>
  );
}
