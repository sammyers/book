import { useEffect, useRef } from "react";

import type { RefObject } from "react";

export const useSyncedRef = <T>(value: T): RefObject<T> => {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
