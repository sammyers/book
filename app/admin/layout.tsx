import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { WrenchIcon } from "@phosphor-icons/react/ssr";
import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";
import { getCurrentUserPermissionLevel } from "@/utils/supabase/users";

import ThemeToggle from "../(logged-in)/ThemeToggle";
import AdminPageTabs from "./AdminPageTabs";

import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient();

  const permissionLevel = await getCurrentUserPermissionLevel(supabase);

  if (permissionLevel !== "super_admin") {
    redirect("/");
  }

  return (
    <div className="h-full flex flex-col">
      <Navbar className="bg-secondary-50 border-b border-b-secondary-100">
        <NavbarBrand className="text-secondary-700 gap-2">
          <WrenchIcon size={32} weight="duotone" />
          <p className="font-bold">Admin</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          <ThemeToggle />
          <NavbarItem>
            <Button as={Link} href="/" color="secondary" variant="flat">
              Exit
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <main className="grow flex flex-col px-4 pt-4 pb-8 bg-content1 gap-4">
        <AdminPageTabs />
        {children}
      </main>
    </div>
  );
}
