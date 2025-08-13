"use client";

import { createPortal } from "react-dom";

import { useHeaderContext } from "./HeaderProvider";

import type { ReactNode } from "react";

export function HeaderPortal({ children }: { children: ReactNode }) {
  const { headerRef } = useHeaderContext();

  if (!headerRef?.current) {
    return null;
  }

  return createPortal(children, headerRef.current);
}
