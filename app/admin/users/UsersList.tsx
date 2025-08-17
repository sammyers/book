"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import {
  BaseballCapIcon,
  CalendarIcon,
  ClipboardTextIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  WarningIcon,
  WrenchIcon,
} from "@phosphor-icons/react";
import { DateTime } from "luxon";
import { useCallback, useMemo, useState } from "react";

import { useDebouncedState } from "@/utils/hooks/useDebouncedState";
import { createClient } from "@/utils/supabase/browser";

import { getUsersQuery } from "../adminPageQueries";
import InviteUserModal from "./InviteUserModal";

import type { ChipProps } from "@heroui/chip";
import type { Team, User } from "../adminPageQueries";

const MembershipChip = ({ team, permission_level }: User["memberships"][number]) => {
  const { color, icon } = useMemo(() => {
    let color: ChipProps["color"] = "secondary";
    let icon: React.ReactNode = null;
    if (permission_level === "manager") {
      color = "primary";
      icon = <BaseballCapIcon size={16} weight="duotone" />;
    } else if (permission_level === "scorekeeper") {
      color = "success";
      icon = <ClipboardTextIcon size={16} weight="duotone" />;
    } else if (permission_level === "member") {
      color = "default";
      icon = <UserIcon size={16} weight="duotone" />;
    }
    return { color, icon };
  }, [permission_level]);

  return (
    <Chip
      size="sm"
      color={color}
      variant="flat"
      startContent={icon}
      className="shrink-0 pl-2 [&>span]:font-medium"
    >
      {team.name} ({permission_level})
    </Chip>
  );
};

interface Props {
  initialUsers: User[];
  teams: Team[];
}

export default function UsersList({ initialUsers, teams }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const fetchUsers = useCallback(async (search: string) => {
    const supabase = createClient();

    const { data } = await getUsersQuery(supabase).ilike("email", `%${search}%`);

    if (data) {
      setUsers(data);
    }
  }, []);

  const [searchValue, setSearchValue] = useDebouncedState<string>("", fetchUsers);

  return (
    <Card classNames={{ header: "p-4", body: "p-4 pt-0" }}>
      <CardHeader className="flex gap-2">
        <Input
          aria-label="Search users"
          placeholder="Search users..."
          isClearable
          startContent={<MagnifyingGlassIcon size={20} className="text-foreground-500" />}
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <InviteUserModal teams={teams} />
      </CardHeader>
      <CardBody>
        <ul className="flex flex-col gap-4">
          {users.map(
            ({
              id,
              first_name,
              last_name,
              email,
              permission_level,
              memberships,
              joined_at,
              is_confirmed,
              has_set_password,
            }) => (
              <Card key={id} as="li" className="list-none border border-divider" shadow="none">
                <CardBody>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1">
                        <p className="text-lg font-medium">
                          {first_name} {last_name}
                        </p>
                        <p className="text-sm text-gray-500 italic">{email}</p>
                      </div>
                      <div className="flex gap-1">
                        {!is_confirmed && (
                          <Chip
                            size="sm"
                            color="warning"
                            variant="flat"
                            startContent={<EnvelopeIcon size={16} weight="duotone" />}
                            className="shrink-0 pl-2 [&>span]:font-medium"
                          >
                            Pending Invite
                          </Chip>
                        )}
                        {is_confirmed && !has_set_password && (
                          <Chip
                            size="sm"
                            color="danger"
                            variant="flat"
                            startContent={<WarningIcon size={16} weight="duotone" />}
                            className="shrink-0 pl-2 [&>span]:font-medium"
                          >
                            No Password Set
                          </Chip>
                        )}
                        {is_confirmed && has_set_password && (
                          <Chip size="sm" color="success" variant="flat">
                            Active
                          </Chip>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-default-500">
                      <CalendarIcon size={14} weight="duotone" />
                      Joined {DateTime.fromISO(joined_at).toLocaleString(DateTime.DATE_MED)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {permission_level === "super_admin" && (
                        <Chip
                          size="sm"
                          color="secondary"
                          variant="flat"
                          startContent={<WrenchIcon size={16} weight="duotone" />}
                          className="shrink-0 pl-2 [&>span]:font-medium"
                        >
                          Platform Admin
                        </Chip>
                      )}
                      {memberships.map(membership => (
                        <MembershipChip key={membership.team.name} {...membership} />
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ),
          )}
        </ul>
      </CardBody>
    </Card>
  );
}
