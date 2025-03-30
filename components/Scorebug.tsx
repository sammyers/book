"use client";

import { cn } from "@heroui/react";
import { forwardRef } from "react";

import type { ComponentPropsWithoutRef } from "react";

const getClassNameForBase = (filled: boolean) =>
  filled ? "stroke-warning fill-warning" : "stroke-white";
const getClassNameForOut = (filled: boolean) =>
  filled ? "stroke-danger fill-danger" : "stroke-white";

interface ScorebugProps extends ComponentPropsWithoutRef<"svg"> {
  baseRunners: Record<1 | 2 | 3, boolean>;
  outs: 0 | 1 | 2 | 3;
}

export const Scorebug = forwardRef<SVGSVGElement, ScorebugProps>(
  ({ className, baseRunners, outs, ...props }, ref) => {
    return (
      <svg
        className={cn("size-12", className)}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={ref}
      >
        <rect
          y="1.27892"
          width="32.0297"
          height="32.0297"
          transform="matrix(0.768826 0.639458 -0.768826 0.639458 32.1462 40.1029)"
          className={getClassNameForBase(baseRunners[3])}
          strokeWidth="3"
        />
        <rect
          y="1.27892"
          width="32.0297"
          height="32.0297"
          transform="matrix(0.768826 0.639458 -0.768826 0.639458 65.3802 12.4611)"
          className={getClassNameForBase(baseRunners[2])}
          strokeWidth="3"
        />
        <rect
          y="1.27892"
          width="32.0297"
          height="32.0297"
          transform="matrix(0.768826 0.639458 -0.768826 0.639458 98.6143 40.1029)"
          className={getClassNameForBase(baseRunners[1])}
          strokeWidth="3"
        />
        <circle
          cx="31"
          cy="108"
          r="9"
          className={getClassNameForOut(outs >= 1)}
          strokeWidth="3"
        />
        <circle
          cx="64"
          cy="108"
          r="9"
          className={getClassNameForOut(outs >= 2)}
          strokeWidth="3"
        />
        <circle
          cx="97"
          cy="108"
          r="9"
          className={getClassNameForOut(outs === 3)}
          strokeWidth="3"
        />
      </svg>
    );
  },
);
Scorebug.displayName = "Scorebug";
