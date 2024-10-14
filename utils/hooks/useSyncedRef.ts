import { useEffect, useRef } from "react";

export const useSyncedRef = <T>(value: T): React.MutableRefObject<T> => {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
