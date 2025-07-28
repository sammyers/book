import { Card } from "@heroui/card";
import { cn } from "@heroui/react";

import { bgGradient } from "../styles";

import type { ReactNode } from "react";

export default function EntryLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className={cn(
        "h-full text-foreground flex flex-col justify-center px-4",
        bgGradient,
      )}
    >
      <Card className="p-2 min-[400px]:w-[368px] min-[400px]:self-center">
        {children}
      </Card>
    </main>
  );
}
