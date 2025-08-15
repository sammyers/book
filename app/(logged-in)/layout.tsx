import { cn } from "@heroui/react";

import { HeaderProvider } from "@/components/HeaderProvider";

import { bgGradient } from "../styles";
import PageHeader from "./PageHeader";

import type { ReactNode } from "react";

export default async function LoggedInLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={cn("h-full flex flex-col overflow-auto", bgGradient)}>
      <HeaderProvider>
        <PageHeader />
        <main className="grow flex px-4 pt-4 pb-8 bg-content1 justify-center">
          {children}
        </main>
      </HeaderProvider>
    </div>
  );
}
