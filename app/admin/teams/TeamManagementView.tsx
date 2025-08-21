"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { ScrollShadow } from "@heroui/react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

import { useDebouncedState } from "@/utils/hooks/useDebouncedState";
import { useFlashToast } from "@/utils/hooks/useFlashToast";
import { createClient } from "@/utils/supabase/browser";

import { getTeamsQuery } from "../queries";
import NewTeamModal from "./NewTeamModal";
import TeamListItem from "./TeamListItem";

import type { Region, Team } from "../queries";

interface Props {
  initialTeams: Team[];
  regions: Region[];
}

export default function TeamManagementView({ initialTeams, regions }: Props) {
  useFlashToast();

  const [teams, setTeams] = useState<Team[]>(initialTeams);

  const fetchTeams = useCallback(async (search: string) => {
    const supabase = createClient();

    const { data } = await getTeamsQuery(supabase).ilike("name", `%${search}%`);

    if (data) {
      setTeams(data);
    }
  }, []);

  const [searchValue, setSearchValue] = useDebouncedState<string>("", fetchTeams);

  return (
    <Card classNames={{ header: "p-4", body: "p-4 pt-0" }}>
      <CardHeader className="flex gap-2">
        <Input
          aria-label="Search teams"
          placeholder="Search teams..."
          isClearable
          startContent={<MagnifyingGlassIcon size={20} className="text-foreground-500" />}
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <NewTeamModal regions={regions} />
      </CardHeader>
      <CardBody>
        <ScrollShadow>
          <ul className="flex flex-col gap-4">
            {teams.map(team => (
              <TeamListItem key={team.id} {...team} />
            ))}
          </ul>
        </ScrollShadow>
      </CardBody>
    </Card>
  );
}
