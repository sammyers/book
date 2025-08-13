"use client";

import { Tab, Tabs } from "@heroui/tabs";
import {
  BaseballCapIcon,
  BaseballIcon,
  ChartBarIcon,
} from "@phosphor-icons/react";

import type { ReactNode } from "react";

interface Props {
  roster: ReactNode;
  games: ReactNode;
}

export default function TeamPageTabs({ roster, games }: Props) {
  return (
    <Tabs
      aria-label="Team management tabs"
      classNames={{ base: "self-center" }}
      defaultSelectedKey="/games"
    >
      <Tab
        key="/games"
        title={
          <div className="flex items-center space-x-2">
            <BaseballIcon weight="duotone" size={20} />
            <span>Games</span>
          </div>
        }
      >
        {games}
      </Tab>
      <Tab
        key="/roster"
        title={
          <div className="flex items-center space-x-2">
            <BaseballCapIcon weight="duotone" size={20} />
            <span>Roster</span>
          </div>
        }
      >
        {roster}
      </Tab>
      <Tab
        key="/stats"
        title={
          <div className="flex items-center space-x-2">
            <ChartBarIcon weight="duotone" size={20} />
            <span>Stats</span>
          </div>
        }
      >
        {/* Placeholder for Stats tab content */}
        <div className="p-4">Stats management will be implemented here.</div>
      </Tab>
    </Tabs>
  );
}
