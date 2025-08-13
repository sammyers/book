import { Card } from "@heroui/card";

import type { ReactNode } from "react";

export default function EntryLayout({ children }: { children: ReactNode }) {
  return (
    <main className="dark h-full bg-background text-foreground flex flex-col justify-center px-4">
      <Card className="p-2 min-[400px]:w-[368px] min-[400px]:self-center">
        {children}
      </Card>
    </main>
  );
}
