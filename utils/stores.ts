import type { StateCreator } from "zustand";

type SetState<T> = Parameters<StateCreator<T>>[0];

interface ActionCreatorFunctions<Store, Args> {
  action(store: Store, args: Args, isOptimistic?: boolean): Store | Partial<Store>;
  success?(store: Store, args: Args): Store | Partial<Store>;
  error?(store: Store, args: Args, error?: Error): Store | Partial<Store>;
}

export interface ActionWrapper<Args = null> {
  (
    args: Args,
    isOptimistic: true,
  ): {
    handleSuccess: () => void;
    handleError: (error: Error) => void;
  };
  (args: Args, isOptimistic?: false): void;
}

export function createAsyncAction<Store>(set: SetState<Store>) {
  const actionCreator = <Args = null>({
    action: actionFn,
    success: successFn,
    error: errorFn,
  }: ActionCreatorFunctions<Store, Args>) => {
    const actionWrapper = ((args: Args, isOptimistic?: boolean) => {
      set(state => actionFn(state, args, isOptimistic));
      if (isOptimistic) {
        return {
          handleSuccess: () => {
            if (successFn) {
              set(state => successFn(state, args));
            }
          },
          handleError: (error: Error) => {
            if (errorFn) {
              set(state => errorFn(state, args, error));
            }
          },
        };
      }
    }) as ActionWrapper<Args>;
    return actionWrapper;
  };
  return actionCreator;
}
