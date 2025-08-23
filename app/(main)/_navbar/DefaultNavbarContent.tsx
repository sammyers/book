import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";

import ThemeToggle from "../../../components/ThemeToggle";
import UserMenu from "../UserMenu";

export default function DefaultNavbarContent() {
  return (
    <Navbar className="bg-default-100 border-b border-b-default-200">
      <NavbarContent>
        {/* <NavbarMenuToggle /> */}
        <NavbarBrand>
          <p className="font-bold text-inherit">BOOK</p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent as="div" justify="end">
        <ThemeToggle />
        <UserMenu />
      </NavbarContent>
    </Navbar>
  );
}
