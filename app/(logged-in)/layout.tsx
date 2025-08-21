import { cn } from "@heroui/react";

import { HeaderProvider } from "@/components/HeaderProvider";

import PageHeader from "./PageHeader";

import type { ReactNode } from "react";

export default async function LoggedInLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn("h-full flex flex-col pt-16")}>
      <HeaderProvider>
        <PageHeader />
        <main className="grow flex bg-content1 justify-center overflow-y-auto">{children}</main>
      </HeaderProvider>
    </div>
  );
}
