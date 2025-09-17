"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import {
  ArrowRightIcon,
  CalendarBlankIcon,
  ClockIcon,
  MapPinAreaIcon,
  TrophyIcon,
} from "@phosphor-icons/react/ssr";
import { DateTime } from "luxon";
import Link from "next/link";
import { useMemo } from "react";

import { ListItem } from "@/components/List";
import { getOpponentPrefix, getReadableDateAndTime } from "@/utils/display";

import { getOpponentTeam } from "./utils";

import type { UpcomingGame } from "../../queries";

function GameTime({ startTime }: { startTime: string }) {
  const { date, time } = useMemo(
    () => getReadableDateAndTime(DateTime.fromISO(startTime)),
    [startTime],
  );

  return (
    <div className="flex items-center gap-1 text-foreground-500">
      {date ? (
        <CalendarBlankIcon size={16} weight="duotone" className="text-warning" />
      ) : (
        <ClockIcon size={16} weight="duotone" className="text-warning" />
      )}
      {date && (
        <>
          <p className="text-small">{date}</p>
          <p className="text-small">•</p>
        </>
      )}
      <p className="text-small">{time}</p>
    </div>
  );
}

export default function UpcomingGame(props: UpcomingGame & { teamId: string }) {
  const {
    role,
    game: { id, name, tournament, location, field, start_time },
    teamId,
  } = props;

  return (
    <ListItem>
      <ListItem.Content className="gap-2">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h3 className="font-bold">
              <span className="text-primary-700">{getOpponentPrefix(role)}</span>{" "}
              {getOpponentTeam(props)?.name}
            </h3>
            {name ? <h5 className="italic text-tiny text-foreground-400">{name}</h5> : null}
          </div>
          {tournament && (
            <Chip
              size="sm"
              color="secondary"
              variant="flat"
              startContent={<TrophyIcon size={16} weight="duotone" />}
              className="pl-2"
            >
              {tournament.name}
            </Chip>
          )}
        </div>
        <div className="flex items-center justify-between gap-1">
          <div className="flex flex-col gap-1">
            {start_time && <GameTime startTime={start_time} />}
            {location && (
              <div className="flex items-center gap-1 text-foreground-500">
                <MapPinAreaIcon size={16} weight="duotone" className="text-success" />
                <p className="text-small">{location.name}</p>
                {field && (
                  <>
                    <p className="text-small">•</p>
                    <p className="text-small">{field}</p>
                  </>
                )}
              </div>
            )}
          </div>
          <Button
            color="primary"
            variant="flat"
            as={Link}
            href={`/game/${id}?teamId=${teamId}`}
            isIconOnly
            startContent={<ArrowRightIcon size={16} weight="duotone" />}
          />
        </div>
      </ListItem.Content>
    </ListItem>
  );
}
