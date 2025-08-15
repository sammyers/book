"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import {
  CalendarIcon,
  NotePencilIcon,
  TrashIcon,
  UserCirclePlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { DateTime } from "luxon";
import Link from "next/link";
import { useMemo } from "react";

import { PlayerPositionChip } from "@/components/PlayerPositionChip";
import { getPositions } from "@/utils/display";
import { useFlashToast } from "@/utils/hooks/useFlashToast";

import type { TeamRosterPlayer } from "../../queries";

export default function TeamRosterClient({
  players,
  teamId,
}: {
  players: TeamRosterPlayer[];
  teamId: string;
}) {
  useFlashToast();

  const addPlayersButton = useMemo(() => {
    return (
      <Button
        className="self-center"
        color="primary"
        variant="flat"
        startContent={<UserCirclePlusIcon size={20} weight="duotone" />}
        as={Link}
        href={`/team/${teamId}/roster/add`}
      >
        Add Players
      </Button>
    );
  }, []);

  const renderPlayerCard = ({
    player,
    jersey_number,
    joined_at,
  }: TeamRosterPlayer) => (
    <div
      key={player.id}
      className="flex flex-col gap-2 bg-content1 border border-divider rounded-lg p-3"
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              {player.nickname ? player.nickname : player.name}
            </p>
            {jersey_number && (
              <p className="text-xs text-gray-500 pt-px">#{jersey_number}</p>
            )}
          </div>
          {player.nickname && (
            <span className="text-xs text-gray-500">{player.name}</span>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="light"
            className="text-default-500"
            isIconOnly
            isDisabled
          >
            <NotePencilIcon size={20} weight="duotone" />
          </Button>
          <Button
            size="sm"
            variant="light"
            color="danger"
            isIconOnly
            isDisabled
          >
            <TrashIcon size={20} weight="duotone" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <PlayerPositionChip {...player} />
        <div className="flex items-center gap-1 text-xs text-default-500">
          <CalendarIcon size={14} weight="duotone" />
          <span>
            Joined{" "}
            {DateTime.fromISO(joined_at).toLocaleString(DateTime.DATE_MED)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex flex-col items-center gap-2">
        <UsersThreeIcon
          size={48}
          weight="duotone"
          className="text-default-400"
        />
        <p className="text-sm text-default-400">No players on roster</p>
      </div>
      {addPlayersButton}
    </div>
  );

  return (
    <>
      {/* Mobile List View */}
      <div className="block md:hidden">
        <Card shadow="sm" classNames={{ header: "p-4", body: "p-4 pt-0" }}>
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Team Roster</h3>
            {players.length > 0 && addPlayersButton}
          </CardHeader>
          <CardBody>
            {players.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="flex flex-col gap-3">
                {players.map((player) => renderPlayerCard(player))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table
          className="flex-1"
          topContent={
            <div className="h-10 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Team Roster</h3>
              {players.length > 0 && addPlayersButton}
            </div>
          }
        >
          <TableHeader>
            <TableColumn>Player</TableColumn>
            <TableColumn align="center">Position</TableColumn>
            <TableColumn align="center">Joined</TableColumn>
            <TableColumn align="center">Actions</TableColumn>
          </TableHeader>
          <TableBody emptyContent={renderEmptyState()} items={players}>
            {({ joined_at, player, jersey_number }) => (
              <TableRow key={player.id}>
                <TableCell>
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {player.nickname ? player.nickname : player.name}
                      </span>
                      {jersey_number && (
                        <span className="text-xs text-gray-500 pt-px">
                          #{jersey_number}
                        </span>
                      )}
                    </div>
                    {player.nickname && (
                      <span className="text-xs text-gray-500">
                        {player.name}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getPositions(player)}</TableCell>
                <TableCell>
                  {DateTime.fromISO(joined_at).toLocaleString(
                    DateTime.DATE_MED,
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    <Button
                      size="sm"
                      variant="light"
                      className="text-default-500"
                      isIconOnly
                      isDisabled
                    >
                      <NotePencilIcon size={20} weight="duotone" />
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      isIconOnly
                      isDisabled
                    >
                      <TrashIcon size={20} weight="duotone" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
