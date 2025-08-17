"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import {
  NotePencilIcon,
  TrashIcon,
  UserCirclePlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { DateTime } from "luxon";
import Link from "next/link";
import { useMemo } from "react";

import { getPositions } from "@/utils/display";
import { useFlashToast } from "@/utils/hooks/useFlashToast";

import PlayerCard from "./PlayerCard";

import type { Key } from "react";
import type { TeamRosterPlayer } from "../../queries";

const columns = [
  { key: "player", label: "Player" },
  { key: "position", label: "Position" },
  { key: "joined", label: "Joined" },
  { key: "actions", label: "Actions" },
];

const renderCell = (columnKey: Key, { player, jersey_number, joined_at }: TeamRosterPlayer) => {
  switch (columnKey) {
    case "player":
      return (
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {player.nickname ? player.nickname : player.name}
            </span>
            {jersey_number && <span className="text-xs text-gray-500 pt-px">#{jersey_number}</span>}
          </div>
          {player.nickname && <span className="text-xs text-gray-500">{player.name}</span>}
        </div>
      );
    case "position":
      return <span>{getPositions(player)}</span>;
    case "joined":
      return <span>{DateTime.fromISO(joined_at).toLocaleString(DateTime.DATE_MED)}</span>;
    case "actions":
      return (
        <div className="flex gap-1 justify-center">
          <Button size="sm" variant="light" className="text-default-500" isIconOnly isDisabled>
            <NotePencilIcon size={20} weight="duotone" />
          </Button>
          <Button size="sm" variant="light" color="danger" isIconOnly isDisabled>
            <TrashIcon size={20} weight="duotone" />
          </Button>
        </div>
      );
    default:
      return null;
  }
};

interface TeamRosterClientProps {
  players: TeamRosterPlayer[];
  teamId: string;
  isManager: boolean;
}

export default function TeamRosterClient({ players, teamId, isManager }: TeamRosterClientProps) {
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
  }, [teamId]);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex flex-col items-center gap-2">
        <UsersThreeIcon size={48} weight="duotone" className="text-default-400" />
        <p className="text-default-400">No players on roster</p>
      </div>
      {isManager && addPlayersButton}
    </div>
  );

  const visibleColumns = useMemo(() => {
    return columns.filter(column => {
      if (column.key === "actions") {
        return isManager;
      }
      return true;
    });
  }, [isManager]);

  return (
    <>
      {/* Mobile List View */}
      <div className="block md:hidden">
        <Card shadow="sm" classNames={{ header: "p-4", body: "p-4 pt-0" }}>
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Team Roster</h3>
            {isManager && players.length > 0 && addPlayersButton}
          </CardHeader>
          <CardBody>
            {players.length > 0 ? (
              <div className="flex flex-col gap-3">
                {players.map(player => (
                  <PlayerCard key={player.player.id} {...player} isManager={isManager} />
                ))}
              </div>
            ) : (
              renderEmptyState()
            )}
          </CardBody>
        </Card>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table
          aria-label="Team Roster"
          className="flex-1"
          topContent={
            <div className="h-10 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Team Roster</h3>
              {isManager && players.length > 0 && addPlayersButton}
            </div>
          }
        >
          <TableHeader columns={visibleColumns}>
            {({ key, label }) => (
              <TableColumn key={key} align={key === "player" ? "start" : "center"}>
                {label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={renderEmptyState()} items={players}>
            {item => (
              <TableRow key={item.player.id}>
                {columnKey => <TableCell>{renderCell(columnKey, item)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
