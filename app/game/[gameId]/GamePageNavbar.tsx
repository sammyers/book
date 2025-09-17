"use client";

import { Badge } from "@heroui/react";
import { Tab, Tabs } from "@heroui/tabs";
import {
  BaseballHelmetIcon,
  BaseballIcon,
  ClipboardTextIcon,
  SlidersIcon,
} from "@phosphor-icons/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

import { StickyFooter } from "@/components/StickyFooter";

import type { Enums } from "@/utils/supabase/database.types";
import type { ReactNode } from "react";

function TabTitle({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-center gap-1">{children}</div>;
}

interface Props {
  gameStatus: Enums<"game_status">;
}

export default function GamePageNavbar({ gameStatus }: Props) {
  const router = useRouter();
  const { gameId, path } = useParams<{ gameId: string; path?: string[] }>();
  const searchParams = useSearchParams();

  const joinedPath = path?.join("/") ?? "";
  const teamId = searchParams.get("teamId");

  const changeTab = useCallback(
    (tab: string, replace = false) => {
      let newPath = `/game/${gameId}/${tab}` as const;
      if (teamId) {
        newPath = `${newPath}?teamId=${teamId}`;
      }
      if (replace) {
        router.replace(newPath);
      } else {
        router.push(newPath);
      }
    },
    [gameId, router, teamId],
  );

  useEffect(() => {
    if (joinedPath === "" && gameStatus === "not_started") {
      changeTab("lineup", true);
    }
  }, [joinedPath, gameStatus, changeTab]);

  return (
    <StickyFooter className="items-center shadow-small">
      <Tabs
        aria-label="Game page tabs"
        variant="light"
        classNames={{
          base: "w-full max-w-[1024px] mx-auto z-20 px-2",
          tabList: "grow",
          tab: "h-14",
        }}
        selectedKey={joinedPath}
        onSelectionChange={value => {
          changeTab(value as string);
        }}
      >
        <Tab
          key=""
          isDisabled={gameStatus === "not_started"}
          title={
            <TabTitle>
              <BaseballIcon size={24} weight="duotone" />
              <span>Game</span>
            </TabTitle>
          }
        />
        <Tab
          key="lineup"
          title={
            <Badge
              isInvisible={gameStatus !== "not_started"}
              color="warning"
              content=""
              shape="circle"
              showOutline={false}
              size="sm"
            >
              <TabTitle>
                <BaseballHelmetIcon size={24} weight="duotone" />
                <span>Lineup</span>
              </TabTitle>
            </Badge>
          }
        />
        <Tab
          key="box"
          isDisabled={gameStatus === "not_started"}
          title={
            <TabTitle>
              <ClipboardTextIcon size={24} weight="duotone" />
              <span>Box</span>
            </TabTitle>
          }
        />
        <Tab
          key="settings"
          title={
            <TabTitle>
              <SlidersIcon size={24} weight="duotone" />
              <span>Settings</span>
            </TabTitle>
          }
        />
      </Tabs>
    </StickyFooter>
  );
}
