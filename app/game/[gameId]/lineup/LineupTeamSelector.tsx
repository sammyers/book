import { Tab, Tabs } from "@heroui/tabs";
import { StarIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";

import { useGameStore } from "../_store/store";

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
  selectedTeamId: string;
  setSelectedTeamId: (teamId: string) => void;
}

export function LineupTeamSelector({ primaryTeamId, selectedTeamId, setSelectedTeamId }: Props) {
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
        selectedKey={selectedTeamId}
        onSelectionChange={key => setSelectedTeamId(key as string)}
      >
        <Tab key={awayTeam.id} title={<TeamTitle {...awayTeam} />} />
        <Tab key={homeTeam.id} title={<TeamTitle {...homeTeam} />} />
      </Tabs>
    </div>
  );
}
