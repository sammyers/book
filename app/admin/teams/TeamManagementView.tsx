"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { ScrollShadow } from "@heroui/react";
import {
  CalendarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  NotePencilIcon,
  TrashIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { DateTime } from "luxon";
import { useCallback, useState } from "react";

import { useDebouncedState } from "@/utils/hooks/useDebouncedState";
import { createClient } from "@/utils/supabase/browser";

import { getTeamsQuery } from "../adminPageQueries";
import NewTeamModal from "./NewTeamModal";

import type { Team } from "../adminPageQueries";

interface Props {
  initialTeams: Team[];
}

const getTeamLocation = (
  location_city: string | null,
  location_state: string | null,
) => {
  if (location_city && location_state) {
    return `${location_city}, ${location_state}`;
  } else if (location_city) {
    return location_city;
  } else if (location_state) {
    return location_state;
  }
  return null;
};

export default function TeamManagementView({ initialTeams }: Props) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);

  const fetchTeams = useCallback(async (search: string) => {
    const supabase = createClient();

    const { data } = await getTeamsQuery(supabase).ilike("name", `%${search}%`);

    if (data) {
      setTeams(data);
    }
  }, []);

  const [searchValue, setSearchValue] = useDebouncedState<string>(
    "",
    fetchTeams,
  );

  return (
    <Card classNames={{ header: "p-4", body: "p-4 pt-0" }}>
      <CardHeader className="flex gap-2">
        <Input
          aria-label="Search teams"
          placeholder="Search teams..."
          isClearable
          startContent={
            <MagnifyingGlassIcon size={20} className="text-foreground-500" />
          }
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <NewTeamModal />
      </CardHeader>
      <CardBody>
        <ScrollShadow>
          <ul className="flex flex-col gap-4">
            {teams.map(
              ({
                id,
                name,
                created_at,
                users: [{ count: numUsers }],
                admin_note,
                location_city,
                location_state,
              }) => (
                <Card
                  key={id}
                  as="li"
                  className="list-none border border-divider"
                  shadow="none"
                >
                  <CardBody>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1">
                          <p className="text-lg font-medium">{name}</p>
                          {admin_note && (
                            <p className="text-sm italic text-default-500">
                              {admin_note}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="primary"
                            as={Link}
                            href={`/team/${id}`}
                          >
                            <EyeIcon size={20} weight="duotone" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-default-500"
                            isDisabled
                          >
                            <NotePencilIcon size={20} weight="duotone" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            isDisabled
                          >
                            <TrashIcon size={20} weight="duotone" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-default-600">
                        {getTeamLocation(location_city, location_state) && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon
                              size={16}
                              weight="fill"
                              className="text-success"
                            />
                            {getTeamLocation(location_city, location_state)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <UsersIcon
                            size={16}
                            weight="fill"
                            className="text-warning"
                          />
                          {numUsers} member{numUsers !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-default-500">
                        <CalendarIcon size={14} weight="duotone" />
                        Created{" "}
                        {DateTime.fromISO(created_at).toLocaleString(
                          DateTime.DATE_MED,
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ),
            )}
          </ul>
        </ScrollShadow>
      </CardBody>
    </Card>
  );
}
