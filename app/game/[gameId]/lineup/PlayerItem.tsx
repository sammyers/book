import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@heroui/button";
import { cn, Spinner } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { BaseballHelmetIcon, ChairIcon, UserMinusIcon } from "@phosphor-icons/react";
import { useCallback } from "react";

import { PlayerNameplate } from "@/components/PlayerNameplate";
import { PlayerPositionChip } from "@/components/PlayerPositionChip";

import { useFieldingPositionOptions, usePlayer, usePlayerActions } from "./context";

import type { FieldingPosition } from "@/utils/supabase/database.types";
import type { Selection } from "@heroui/react";
import type { ComponentProps } from "react";
import type { LineupViewPlayer } from "../_store/selectors";

export interface PlayerItemProps extends ComponentProps<"div"> {
  playerId: string;
}

export function PlayerItem({ playerId, className, ...props }: PlayerItemProps) {
  const player = usePlayer(playerId);

  const content = player.isInGame ? (
    player.isInLineup ? (
      <LineupPlayerContent player={player} />
    ) : (
      <BenchPlayerContent player={player} />
    )
  ) : (
    <RosterPlayerContent player={player} />
  );

  const isPending = player.isInGame ? player.isPending : player.isRemovalPending;

  return (
    <div
      className={cn(
        "w-full",
        "flex",
        "flex-col",
        "bg-default-50",
        "border",
        "border-default-100",
        "rounded-lg",
        "p-2",
        "cursor-grab",
        isPending && "opacity-75",
        className,
      )}
      {...props}
    >
      {content}
    </div>
  );
}

export function SortablePlayerItem({
  playerId,
  containerId,
}: {
  playerId: string;
  containerId: string;
}) {
  const { attributes, listeners, transform, transition, setNodeRef, isDragging } = useSortable({
    id: playerId,
    data: { containerId },
  });

  const style = { transform: CSS.Translate.toString(transform), transition };

  return (
    <PlayerItem
      playerId={playerId}
      {...attributes}
      {...listeners}
      className={cn("touch-none", isDragging && "opacity-50")}
      style={style}
      ref={setNodeRef}
    />
  );
}

type RosterPlayer = Extract<LineupViewPlayer, { isInGame: false }>;
type LineupPlayer = Extract<LineupViewPlayer, { isInGame: true; isInLineup: true }>;
type BenchPlayer = Extract<LineupViewPlayer, { isInGame: true; isInLineup: false }>;

function RosterPlayerContent({ player }: { player: RosterPlayer }) {
  const { addToGame } = usePlayerActions(player.player.id);

  return (
    <>
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <PlayerNameplate {...player} />
          {player.isRemovalPending && <Spinner size="sm" color="default" />}
        </div>
        <div className="flex items-center gap-3">
          <PlayerPositionChip {...player.player} />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              color="success"
              onPress={() => addToGame(false)}
              isIconOnly
            >
              <BaseballHelmetIcon size={20} weight="duotone" />
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="warning"
              onPress={() => addToGame(true)}
              isIconOnly
            >
              <ChairIcon size={20} weight="duotone" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function LineupPlayerContent({ player }: { player: LineupPlayer }) {
  const { lineupEntry, isPending } = player;

  const fieldingPositions = useFieldingPositionOptions();

  const { moveToBench, removeFromGame, changePosition } = usePlayerActions(player.player.id);

  const handleSelectionChange = useCallback(
    (value: Selection) => {
      changePosition([...value].at(0) as FieldingPosition);
    },
    [changePosition],
  );

  return (
    <div className={cn("flex justify-between items-center gap-2", isPending && "opacity-70")}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center shrink-0 size-8 rounded-full bg-secondary-500/20 text-secondary-500 font-medium">
          {player.lineupEntry.battingOrder}
        </div>
        <div className="flex items-center gap-2">
          <PlayerNameplate {...player} />
          {isPending && <Spinner size="sm" color="default" />}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Select
          aria-label="Position selector"
          size="sm"
          variant="faded"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[lineupEntry.position]}
          onSelectionChange={handleSelectionChange}
          items={fieldingPositions}
          fullWidth={false}
          classNames={{
            base: "min-w-16",
            trigger: "pr-0",
            selectorIcon: "end-1",
          }}
          listboxProps={{
            classNames: {
              base: "p-0",
            },
            itemClasses: {
              base: "p-1",
              selectedIcon: "text-secondary",
            },
          }}
        >
          {({ value, label }) => <SelectItem key={value}>{label}</SelectItem>}
        </Select>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="flat" color="warning" onPress={moveToBench} isIconOnly>
            <ChairIcon size={20} weight="duotone" />
          </Button>
          <Button size="sm" variant="flat" color="danger" onPress={removeFromGame} isIconOnly>
            <UserMinusIcon size={20} weight="duotone" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function BenchPlayerContent({ player }: { player: BenchPlayer }) {
  const { removeFromGame, moveToLineup } = usePlayerActions(player.player.id);

  return (
    <>
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <PlayerNameplate {...player} />
          {player.isPending && <Spinner size="sm" color="default" />}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="flat" color="success" onPress={moveToLineup} isIconOnly>
            <BaseballHelmetIcon size={20} weight="duotone" />
          </Button>
          <Button size="sm" variant="flat" color="danger" onPress={removeFromGame} isIconOnly>
            <UserMinusIcon size={20} weight="duotone" />
          </Button>
        </div>
      </div>
    </>
  );
}
