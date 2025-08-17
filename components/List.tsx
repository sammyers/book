import { cn } from "@heroui/react";

import type { ComponentProps } from "react";

export function List({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col divide-y", className)} {...props} />;
}

export function ListItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("flex items-center py-2 px-3", className)} {...props} />;
}
