import { cn } from "@heroui/react";

import type { ComponentProps } from "react";

export function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-md bg-default-100 text-foreground-500 p-2 flex gap-2 items-center font-medium",
        className,
      )}
      {...props}
    />
  );
}
