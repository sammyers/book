import { cn } from "@heroui/react";

import { bgGradient } from "../styles";

import type { ReactNode } from "react";

export default async function LoggedInLayout({
  children,
  navbar,
}: {
  children: ReactNode;
  navbar: ReactNode;
}) {
  return (
    <div className={cn("h-full flex flex-col overflow-auto", bgGradient)}>
      {navbar}
      <main className="grow flex flex-col px-4 pt-4 pb-8">{children}</main>
    </div>
  );
}
