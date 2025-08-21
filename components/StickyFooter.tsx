import { cn } from "@heroui/react";

import type { ReactNode } from "react";

export function StickyFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "z-20 fixed bottom-0 left-0 right-0 flex bg-default-100 border-t border-t-default-200",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StickyFooterContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-[1024px] px-6 py-4 mx-auto flex gap-x-2 gap-y-3 items-center flex-wrap sm:flex-nowrap",
        className,
      )}
    >
      {children}
    </div>
  );
}
