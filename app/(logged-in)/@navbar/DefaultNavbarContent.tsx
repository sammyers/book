import { Link } from "@heroui/link";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/navbar";

import UserMenu from "./UserMenu";

export default function DefaultNavbarContent() {
  return (
    <Navbar>
      <NavbarContent>
        <NavbarMenuToggle />
        <NavbarBrand>
          <p className="font-bold text-inherit">BOOK</p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent as="div" justify="end">
        <UserMenu />
      </NavbarContent>
      <NavbarMenu>
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
