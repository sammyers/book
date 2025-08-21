import { Navbar, NavbarContent } from "@heroui/navbar";

import PageHeaderContent from "./PageHeaderContent";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

export default function PageHeader() {
  return (
    <Navbar className="fixed bg-default-100 border-b border-b-default-200">
      <NavbarContent className="grow">
        <PageHeaderContent />
      </NavbarContent>
      <NavbarContent as="div" justify="end" className="!flex-grow-0">
        <ThemeToggle />
        <UserMenu />
      </NavbarContent>
    </Navbar>
  );
}
