import { Button } from "@heroui/button";
import { CalendarIcon, NotePencilIcon, TrashIcon } from "@phosphor-icons/react";
import { DateTime } from "luxon";

import { PlayerNameplate } from "@/components/PlayerNameplate";
import { PlayerPositionChip } from "@/components/PlayerPositionChip";

import type { TeamRosterPlayer } from "../../queries";

interface PlayerCardProps extends TeamRosterPlayer {
  isManager: boolean;
}

export default function PlayerCard({ isManager, joined_at, ...props }: PlayerCardProps) {
  const { player } = props;
  return (
    <div
      key={player.id}
      className="flex flex-col gap-2 bg-content1 border border-divider rounded-lg p-2"
    >
      <div className="flex justify-between items-center">
        <PlayerNameplate {...props} />
        {isManager && (
          <div className="flex gap-1">
            <Button size="sm" variant="light" className="text-default-500" isIconOnly isDisabled>
              <NotePencilIcon size={20} weight="duotone" />
            </Button>
            <Button size="sm" variant="light" color="danger" isIconOnly isDisabled>
              <TrashIcon size={20} weight="duotone" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-sm">
        <PlayerPositionChip {...player} />
        <div className="flex items-center gap-1 text-xs text-default-500">
          <CalendarIcon size={14} weight="duotone" />
          <span>Joined {DateTime.fromISO(joined_at).toLocaleString(DateTime.DATE_MED)}</span>
        </div>
      </div>
    </div>
  );
}
