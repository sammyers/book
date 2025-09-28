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
  getVisiblePlayerIds,
} from "../_store/selectors";
import { useGameStore, useGameStoreApi } from "../_store/store";
import {
  BENCH_CONTAINER_ID,
  TEAM_LINEUP_CONTAINER_ID,
  TEAM_ROSTER_CONTAINER_ID,
} from "../_store/types";
import { useLineupViewContext } from "./context";
import { PlayerItem } from "./PlayerItem";

import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import type { ReactNode } from "react";
import type { ContainerId } from "../_store/types";

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
    ({ active, over }: DragOverEvent) => {
      if (!over) {
        return;
      }
      if (active.id === over.id) {
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
      if (over) {
        const draggingPlayerId = active.id as string;
        const originContainerId = getDraggingOriginContainer(store.getState());
        // Could be a player or a container
        const targetId = over.id as string;
        const targetContainerId = getDraggingOverContainer(store.getState());

        if (targetId === BENCH_CONTAINER_ID) {
          if (originContainerId === TEAM_LINEUP_CONTAINER_ID) {
            movePlayerFromLineupToBench(draggingPlayerId);
          }
          if (originContainerId === TEAM_ROSTER_CONTAINER_ID) {
            addPlayerToGameOptimistically(draggingPlayerId, true);
          }
        }

        if (targetId === TEAM_ROSTER_CONTAINER_ID) {
          if (originContainerId !== TEAM_ROSTER_CONTAINER_ID) {
            removePlayerFromGameOptimistically(draggingPlayerId);
          }
        }

        if (
          targetId === TEAM_LINEUP_CONTAINER_ID ||
          targetContainerId === TEAM_LINEUP_CONTAINER_ID
        ) {
          // Target id should only be the lineup container if the lineup is currently empty
          const targetLineupIndex =
            targetId === TEAM_LINEUP_CONTAINER_ID ? -1 : getPlayerLineupIndex(targetId);
          if (originContainerId === TEAM_ROSTER_CONTAINER_ID) {
            addPlayerToGameOptimistically(draggingPlayerId, false, targetLineupIndex);
          }
          if (originContainerId === BENCH_CONTAINER_ID) {
            movePlayerFromBenchToLineup(draggingPlayerId, targetLineupIndex);
          }
          if (originContainerId === TEAM_LINEUP_CONTAINER_ID) {
            changePlayerBattingOrder(draggingPlayerId, targetLineupIndex);
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

  /**
   * The collision detector should work as follows:
   * - If dragging over the lineup, return the lineup container only if there are no players
   *   already in the lineup. Otherwise, return the closest player
   * - If already dragging over the roster or bench container, return that container
   * - If dragging over a player in the roster or bench container, return that container so that
   *   the dragging player doesn't reorder itself
   */
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

      if (overId === null) {
        return [];
      }

      // Dropping over roster or bench container itself is fine
      if (overId === TEAM_ROSTER_CONTAINER_ID || overId === BENCH_CONTAINER_ID) {
        return [{ id: overId }];
      }

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
        // If dropping over an item in the roster or bench, return the container itself instead of the item
        if (
          overData.containerId === TEAM_ROSTER_CONTAINER_ID ||
          overData.containerId === BENCH_CONTAINER_ID
        ) {
          overId = overData.containerId;
        }
      }

      return overId ? [{ id: overId }] : [];
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
