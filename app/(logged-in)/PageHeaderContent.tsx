"use client";

import { useCallback } from "react";

import { useHeaderContext } from "@/components/HeaderProvider";

export default function PageHeaderContent() {
  const { setHeaderRef } = useHeaderContext();

  const assignRef = useCallback(
    (node: HTMLDivElement | null) => {
      setHeaderRef(node);
    },
    [setHeaderRef],
  );

  return <div className="flex grow h-full items-center gap-2" ref={assignRef} />;
}
