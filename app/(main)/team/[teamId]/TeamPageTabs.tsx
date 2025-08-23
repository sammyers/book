"use client";

import { Tab, Tabs } from "@heroui/tabs";
import { BaseballCapIcon, BaseballIcon, ChartBarIcon, TrophyIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function TeamPageTabs({ teamId }: { teamId: string }) {
  const pathname = usePathname();

  const selectedTab = useMemo(() => {
    if (pathname.includes(`/team/${teamId}/games`)) {
      return `/team/${teamId}/games`;
    }
    if (pathname.includes(`/team/${teamId}/tournaments`)) {
      return `/team/${teamId}/tournaments`;
    }
    if (pathname.includes(`/team/${teamId}/roster`)) {
      return `/team/${teamId}/roster`;
    }
    return pathname;
  }, [pathname, teamId]);

  return (
    <Tabs
      aria-label="Team management tabs"
      classNames={{
        base: "w-full sticky top-0 z-20 px-3 pt-4",
        tabList: "grow shadow-small",
      }}
      selectedKey={selectedTab}
    >
      <Tab
        key={`/team/${teamId}/games`}
        as={Link}
        href={`/team/${teamId}/games`}
        title={
          <div className="flex items-center space-x-2">
            <BaseballIcon weight="duotone" size={20} />
            <span className="hidden sm:inline">Games</span>
          </div>
        }
      />
      <Tab
        isDisabled
        key={`/team/${teamId}/tournaments`}
        as={Link}
        href={`/team/${teamId}/tournaments`}
        title={
          <div className="flex items-center space-x-2">
            <TrophyIcon weight="duotone" size={20} />
            <span className="hidden sm:inline">Tournaments</span>
          </div>
        }
      />
      <Tab
        key={`/team/${teamId}/roster`}
        as={Link}
        href={`/team/${teamId}/roster`}
        title={
          <div className="flex items-center space-x-2">
            <BaseballCapIcon weight="duotone" size={20} />
            <span className="hidden sm:inline">Roster</span>
          </div>
        }
      />
      <Tab
        isDisabled
        key={`/team/${teamId}/stats`}
        as={Link}
        href={`/team/${teamId}/stats`}
        title={
          <div className="flex items-center space-x-2">
            <ChartBarIcon weight="duotone" size={20} />
            <span className="hidden sm:inline">Stats</span>
          </div>
        }
      />
    </Tabs>
  );
}
