"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
} from "@nextui-org/react";

import { getPositions, Player } from "@/utils/display";

interface Props {
  players: Player[];
}

export default function TeamRoster({ players }: Props) {
  return (
    <Table className="flex-1">
      <TableHeader>
        <TableColumn>ROSTER</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No players added" items={players}>
        {(item) => (
          <TableRow key={item.id}>
            <TableCell>
              <User name={item.name} description={getPositions(item)} />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
