"use client";

import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/dropdown";
import {
  IdentificationBadgeIcon,
  ListIcon,
  SignOutIcon,
  UserCircleIcon,
  WrenchIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { createClient } from "@/utils/supabase/browser";

import type { MenuItemProps } from "@heroui/menu";
import type { ReactNode } from "react";
import type { UserMenuData } from "./userMenuQuery";

type MenuSectionItem = {
  key: string;
  title: string;
  className?: string;
  color?: MenuItemProps["color"];
  href?: string;
  onPress?: () => void;
  startContent?: ReactNode;
};

type MenuItem = {
  key: string;
  title: string;
  showDivider?: boolean;
} & (
  | {
      type: "item";
      className?: string;
      color?: MenuItemProps["color"];
      startContent?: ReactNode;
    }
  | {
      type: "section";
      items: MenuSectionItem[];
    }
);

export default function UserMenuClient({ user }: { user: UserMenuData }) {
  const router = useRouter();

  const logOut = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    }
  }, [router]);

  const menuItems = useMemo(() => {
    const items: MenuItem[] = [
      {
        type: "item",
        key: "user",
        title: "User",
        className: "text-primary/70 opacity-100",
        startContent: <IdentificationBadgeIcon size={24} weight="duotone" />,
        showDivider: true,
      },
    ];

    if (user.permission_level === "super_admin") {
      items.push({
        type: "section",
        key: "admin",
        title: "Admin",
        showDivider: true,
        items: [
          {
            key: "admin_dashboard",
            title: "Admin Dashboard",
            href: "/admin",
            color: "secondary",
            className: "text-secondary",
            startContent: <WrenchIcon size={20} weight="duotone" />,
            onPress: () => router.push("/admin"),
          },
        ],
      });
    }

    const teamsItems: MenuSectionItem[] = user.teams.map(team => ({
      key: `team_${team.id}`,
      title: team.name,
      href: `/team/${team.id}`,
      className: "text-foreground hover:opacity-100",
    }));

    if (!teamsItems.length) {
      teamsItems.push({
        key: "no_teams",
        className: "italic",
        title: "No teams yet",
      });
    }

    items.push(
      {
        type: "section",
        key: "teams",
        title: "My Teams",
        showDivider: true,
        items: teamsItems,
      },
      {
        type: "section",
        key: "account",
        title: "Account",
        items: [
          {
            key: "my_account",
            title: "My Account",
            startContent: <UserCircleIcon size={20} weight="duotone" />,
          },
          {
            key: "logout",
            title: "Log Out",
            color: "danger",
            className: "text-danger",
            startContent: <SignOutIcon size={20} weight="duotone" />,
          },
        ],
      },
    );
    return items;
  }, [router, user.teams, user.permission_level]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          aria-label="User Menu"
          variant="light"
          radius="full"
          className="text-2xl"
        >
          <ListIcon />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        variant="flat"
        disabledKeys={["user", "no_teams"]}
        onAction={key => {
          if (key === "logout") {
            logOut();
          }
        }}
        items={menuItems}
      >
        {item => {
          if (item.type === "section") {
            const { key, items, ...rest } = item;

            return (
              <DropdownSection key={key} {...rest}>
                {items.map(({ key, title, ...rest }) => {
                  return (
                    <DropdownItem key={key} {...rest}>
                      {title}
                    </DropdownItem>
                  );
                })}
              </DropdownSection>
            );
          }

          const { key, title, ...rest } = item;

          if (key === "user") {
            return (
              <DropdownItem key={key} textValue={title} {...rest}>
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user.email}</p>
              </DropdownItem>
            );
          }

          return (
            <DropdownItem key={key} {...rest}>
              {title}
            </DropdownItem>
          );
        }}
      </DropdownMenu>
    </Dropdown>
  );
}
