"use client";

import { createContext, useCallback, useContext, useState } from "react";

import type { ReactNode, RefObject } from "react";

interface HeaderContextType {
  headerRef: RefObject<HTMLDivElement> | null;
  setHeaderRef: (node: HTMLDivElement | null) => void;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerRef, setHeaderRefRaw] = useState<RefObject<HTMLDivElement> | null>(null);

  const setHeaderRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setHeaderRefRaw({ current: node });
    } else {
      setHeaderRefRaw(null);
    }
  }, []);

  return (
    <HeaderContext.Provider value={{ headerRef, setHeaderRef }}>{children}</HeaderContext.Provider>
  );
}

export const useHeaderContext = () => {
  const context = useContext(HeaderContext);

  if (context === null) {
    throw new Error("useHeaderSlot must be used within a HeaderProvider");
  }
  return context;
};
