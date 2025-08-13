"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { User } from "@heroui/user";
import { UserIcon } from "@phosphor-icons/react/ssr";

import { getPositions } from "@/utils/display";

import type { Player } from "@/utils/display";

export default function TeamRosterTable({ players }: { players: Player[] }) {
  return (
    <Table className="flex-1">
      <TableHeader>
        <TableColumn>ROSTER</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No players added" items={players}>
        {(item) => (
          <TableRow key={item.id}>
            <TableCell>
              <User
                name={item.name}
                description={getPositions(item)}
                avatarProps={{
                  name: undefined,
                  fallback: <UserIcon size={24} weight="duotone" />,
                }}
              />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
