"use client";

import {
  ShieldCheckeredIcon,
  TrophyIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tab, Tabs } from "@/components/Tabs";

export default function AdminPageTabs() {
  const pathname = usePathname();

  return (
    <Tabs selectedKey={pathname} classNames={{ tabList: "grow" }}>
      <Tab
        key="/admin/teams"
        as={Link}
        // @ts-expect-error - scroll is not a valid prop for TabItemProps
        scroll={false}
        href="/admin/teams"
        title={
          <div className="flex items-center space-x-2">
            <UsersThreeIcon weight="duotone" size={20} />
            <span className="hidden sm:inline">Teams</span>
          </div>
        }
      />
      <Tab
        key="/admin/users"
        as={Link}
        // @ts-expect-error - scroll is not a valid prop for TabItemProps
        scroll={false}
        href="/admin/users"
        title={
          <div className="flex items-center space-x-2">
            <UserCircleIcon weight="duotone" size={20} />
            <span className="hidden sm:inline">Users</span>
          </div>
        }
      />
      <Tab
        isDisabled
        key="/admin/permissions"
        as={Link}
        href="/admin/permissions"
        // @ts-expect-error - scroll is not a valid prop for TabItemProps
        scroll={false}
        title={
          <div className="flex items-center space-x-2">
            <ShieldCheckeredIcon weight="duotone" size={20} />
            <span className="hidden sm:inline">Permissions</span>
          </div>
        }
      />
      <Tab
        isDisabled
        key="/admin/tournaments"
        as={Link}
        href="/admin/tournaments"
        // @ts-expect-error - scroll is not a valid prop for TabItemProps
        scroll={false}
        title={
          <div className="flex items-center space-x-2">
            <TrophyIcon weight="duotone" size={20} />
            <span className="hidden sm:inline">Tournaments</span>
          </div>
        }
      />
    </Tabs>
  );
}
