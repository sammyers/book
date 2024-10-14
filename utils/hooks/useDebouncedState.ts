import { debounce } from "lodash";
import { useCallback, useMemo, useState } from "react";

import { useSyncedRef } from "./useSyncedRef";

export interface DebounceOptions {
  // Length of time to delay before updating the state
  wait?: number;
  // Max time to delay before calling onChange
  maxWait?: number;
  // Whether to invoke on the leading edge of the timeout
  leading?: boolean;
  // Whether to invoke on the trailing edge of the timeout
  trailing?: boolean;
}

/**
 * Like `React.useState`, but the state setter function is debounced. Accepts debounce options that
 * are passed to lodash's `debounce` function.
 * @param initialState The initial state value
 * @param onChange A function to call when the debounced value changes
 *
 * @returns A tuple with the same type signature as `useState`'s return type, plus an object with
 * some additional goodies:
 * - `debouncedValue`: The debounced value, this updates at the same time that `onChange` is invoked
 * - `setCurrentValue`: A function to set the current state value without debouncing
 * - `flush`: A function to immediately invoke any delayed updates
 * - `cancel`: A function to cancel any delayed updates
 */
export const useDebouncedState = <T = string>(
  initialState: T,
  onChange?: (value: T) => void,
  { wait = 250, maxWait, leading, trailing }: DebounceOptions = {},
) => {
  const [currentValue, setCurrentValue] = useState<T>(initialState);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialState);

  // Store the latest onChange function in a ref so that the debouncedOnChange function always uses
  // the latest version of the function, but doesn't get redefined on every render if onChange isn't
  // memoized.
  const onChangeRef = useSyncedRef(onChange);

  const debouncedOnChange = useMemo(
    () =>
      debounce(
        (newValue) => {
          onChangeRef.current?.(newValue);
          setDebouncedValue(newValue);
        },
        wait,
        maxWait !== undefined || leading || trailing
          ? { maxWait, leading, trailing }
          : undefined,
      ),
    [setDebouncedValue, wait, maxWait, leading, trailing, onChangeRef],
  );

  const setDebouncedState = useCallback(
    (newValue: T) => {
      setCurrentValue(newValue);
      debouncedOnChange(newValue);
    },
    [setCurrentValue, debouncedOnChange],
  );

  return [
    currentValue,
    setDebouncedState,
    {
      debouncedValue,
      setCurrentValue,
      flush: debouncedOnChange.flush,
      cancel: debouncedOnChange.cancel,
    },
  ] as const;
};
