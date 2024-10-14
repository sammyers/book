import {
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/react";

import UserMenu from "./UserMenu";

export default async function DefaultNavbarContent() {
  return (
    <Navbar isBordered className="bg-content1">
      <NavbarContent>
        <NavbarMenuToggle />
        <NavbarBrand>
          <p className="font-bold text-inherit">BOOK</p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent as="div" justify="end">
        <UserMenu />
      </NavbarContent>
      <NavbarMenu className="bg-content1">
        <NavbarMenuItem key="games">
          <Link className="w-full" size="lg" color="foreground" href="/games">
            Games
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem key="stats">
          <Link className="w-full" size="lg" color="foreground" href="#">
            Stats
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
