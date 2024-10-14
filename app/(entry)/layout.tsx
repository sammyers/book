import { Card } from "@nextui-org/card";

import type { ReactNode } from "react";

export default function EntryLayout({ children }: { children: ReactNode }) {
  return (
    <main className="h-full text-foreground bg-background flex flex-col justify-center mx-4">
      <Card className="p-2 min-[400px]:w-[368px] min-[400px]:self-center">
        {children}
      </Card>
    </main>
  );
}
