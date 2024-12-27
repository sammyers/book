import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { some } from "lodash";
import { forwardRef, useMemo, useState } from "react";

import type { AutocompleteProps } from "@nextui-org/react";
import type { Key } from "@react-types/shared";
import type { CollectionElement } from "@react-types/shared/src/collections";
import type { ForwardedRef, ReactElement, Ref } from "react";

export type CreateItemResult = { key: Key; label: string };

interface CreatableAutocompleteProps<T extends object>
  extends AutocompleteProps<T> {
  onCreate?: (textValue: string) => Promise<CreateItemResult | null>;
  defaultItems: NonNullable<AutocompleteProps<T>["defaultItems"]>;
  onSelectionChange: NonNullable<AutocompleteProps<T>["onSelectionChange"]>;
  children: (item: T) => CollectionElement<T>;
  getKey: (item: T) => Key;
  getLabel: (item: T) => string;
}

function CreatableAutocompleteImpl<T extends object>(
  {
    onCreate,
    defaultItems: defaultItemsProp,
    onSelectionChange,
    getKey,
    getLabel,
    children,
    ...props
  }: CreatableAutocompleteProps<T>,
  ref: ForwardedRef<HTMLElement>,
) {
  const [inputValue, setInputValue] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const supportsCreation = !!onCreate;

  const defaultItems = useMemo(() => {
    if (
      supportsCreation &&
      inputValue.length > 0 &&
      !some(defaultItemsProp, (team) => team.name === inputValue)
    ) {
      return [
        ...defaultItemsProp,
        {
          key: "new-item",
          label: `Add "${inputValue}"`,
          isNewItemOption: true,
        },
      ];
    }
    return Array.from(defaultItemsProp);
  }, [supportsCreation, defaultItemsProp, inputValue]);

  return (
    <Autocomplete
      {...props}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      isClearable={false}
      isLoading={isLoading}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onClear={() => {
        setInputValue("");
        onSelectionChange(null);
      }}
      onSelectionChange={async (key) => {
        console.log("setting selected key", key);
        if (key === "new-item") {
          setIsLoading(true);
          const newItem = await onCreate!(inputValue);
          if (newItem !== null) {
            setInputValue(newItem.label);
            onSelectionChange(newItem.key);
          }
          setIsLoading(false);
        } else {
          const selectedItem = (defaultItems as T[]).find(
            (item) => getKey(item) === key,
          );
          setInputValue(selectedItem ? getLabel(selectedItem) : "");
          onSelectionChange(key);
        }
      }}
      defaultItems={defaultItems}
    >
      {(item) => {
        if ("isNewItemOption" in item) {
          return (
            <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
          );
        }
        return children(item);
      }}
    </Autocomplete>
  );
}

export const CreatableAutocomplete = forwardRef(CreatableAutocompleteImpl) as <
  T extends object,
>(
  props: CreatableAutocompleteProps<T> & { ref: Ref<HTMLElement> },
) => ReactElement;
