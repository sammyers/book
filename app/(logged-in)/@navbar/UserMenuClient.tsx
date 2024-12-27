"use client";

import { Avatar } from "@nextui-org/avatar";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Link } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { createClient } from "@/utils/supabase/browser";

import type { UserMenuData } from "./UserMenu";

const getInitials = (user: UserMenuData) => {
  return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
};

export default function UserMenuClient({ user }: { user: UserMenuData }) {
  const router = useRouter();

  const logOut = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    }
  }, [router]);

  const teamsItems = user.teams.map((team) => (
    <DropdownItem
      key={`team_${team.id}`}
      as={Link}
      href={`/team/${team.id}/manage`}
      className="text-foreground hover:opacity-100"
    >
      {team.name}
    </DropdownItem>
  ));
  if (!teamsItems.length) {
    teamsItems.push(
      <DropdownItem key="no_teams" className="italic">
        No teams yet
      </DropdownItem>,
    );
  }
  teamsItems.push(
    <DropdownItem
      key="create_team"
      color="success"
      className="text-success hover:opacity-100"
      as={Link}
      href="/team/new"
    >
      Create a Team
    </DropdownItem>,
  );

  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="primary"
          size="sm"
          name={getInitials(user)}
        />
      </DropdownTrigger>
      <DropdownMenu
        variant="flat"
        disabledKeys={["user", "no_teams"]}
        onAction={(key) => {
          if (key === "logout") {
            logOut();
          }
        }}
      >
        <DropdownItem
          key="user"
          className="h-14 gap-2"
          textValue="User"
          showDivider
        >
          <p className="font-semibold">Signed in as</p>
          <p className="font-semibold">{user.email}</p>
        </DropdownItem>
        <DropdownSection title="My Teams" showDivider>
          {teamsItems}
        </DropdownSection>
        <DropdownSection title="Account">
          <DropdownItem key="account">My Account</DropdownItem>
          <DropdownItem key="logout" color="danger" className="text-danger">
            Log Out
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
