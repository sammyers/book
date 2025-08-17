"use client";

import { cn } from "@heroui/react";
import { forwardRef } from "react";

import type { ComponentPropsWithoutRef } from "react";

type AlertProps = ComponentPropsWithoutRef<"div">;

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("border-danger text-danger rounded-medium bg-danger/10 p-3", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Alert.displayName = "Alert";
