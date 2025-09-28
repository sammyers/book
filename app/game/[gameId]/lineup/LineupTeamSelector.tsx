import { Tab, Tabs } from "@heroui/tabs";
import { StarIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";

import { getSelectedTeamRole } from "../_store/selectors";
import { useGameStore } from "../_store/store";

import type { TeamRole } from "@/utils/supabase/database.types";

function TeamTitle({ name, isPrimary }: { name: string; isPrimary: boolean }) {
  if (isPrimary) {
    return (
      <div className="flex items-center space-x-2 font-bold">
        <StarIcon weight="duotone" size={16} />
        <span>{name}</span>
      </div>
    );
  }

  return <span>{name}</span>;
}

interface Props {
  primaryTeamId: string;
}

export function LineupTeamSelector({ primaryTeamId }: Props) {
  const selectedTeamRole = useGameStore(getSelectedTeamRole);
  const setSelectedTeamRole = useGameStore(store => store.setSelectedTeamRole);

  const homeTeam = useGameStore(
    useShallow(state => ({
      name: state.teams.home.name,
      id: state.teams.home.id,
      isPrimary: state.teams.home.id === primaryTeamId,
    })),
  );
  const awayTeam = useGameStore(
    useShallow(state => ({
      name: state.teams.away.name,
      id: state.teams.away.id,
      isPrimary: state.teams.away.id === primaryTeamId,
    })),
  );

  return (
    <div className="z-20 absolute top-0 left-14 right-14 h-14 flex items-center justify-center">
      <Tabs
        size="sm"
        classNames={{
          tabList: "shadow-small",
          tabContent: "group-data-[selected=true]:text-primary-500",
        }}
        selectedKey={selectedTeamRole}
        onSelectionChange={key => setSelectedTeamRole(key as TeamRole)}
      >
        <Tab key="away" title={<TeamTitle {...awayTeam} />} />
        <Tab key="home" title={<TeamTitle {...homeTeam} />} />
      </Tabs>
    </div>
  );
}
