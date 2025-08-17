import { Button } from "@heroui/button";
import { CalendarIcon, NotePencilIcon, TrashIcon } from "@phosphor-icons/react";
import { DateTime } from "luxon";

import { PlayerPositionChip } from "@/components/PlayerPositionChip";

import type { TeamRosterPlayer } from "../../queries";

interface PlayerCardProps extends TeamRosterPlayer {
  isManager: boolean;
}

export default function PlayerCard({
  player,
  jersey_number,
  joined_at,
  isManager,
}: PlayerCardProps) {
  return (
    <div
      key={player.id}
      className="flex flex-col gap-2 bg-content1 border border-divider rounded-lg p-3"
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{player.nickname ? player.nickname : player.name}</p>
            {jersey_number && <p className="text-xs text-gray-500 pt-px">#{jersey_number}</p>}
          </div>
          {player.nickname && <span className="text-xs text-gray-500">{player.name}</span>}
        </div>
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
