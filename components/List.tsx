import { Card, CardBody } from "@heroui/card";
import { cn } from "@heroui/react";

import type { CardProps } from "@heroui/card";
import type { ComponentProps } from "react";

export function List({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function ListItem({ className, ...props }: CardProps) {
  return (
    <Card
      as="li"
      shadow="none"
      className={cn("list-none border border-divider", className)}
      {...props}
    />
  );
}

ListItem.Content = CardBody;
