"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button, ButtonGroup } from "@heroui/button";
import { Input } from "@heroui/input";
import { cn } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { PlusIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useController } from "react-hook-form";

import type { Key } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import type { NewLocationFormSchema } from "./forms";
import type { Location } from "./queries";

export interface LocationSelectorProps<T extends FieldValues> {
  className?: string;
  locations: Location[];
  control: Control<T>;
  name: Path<T>;
  label: string;
  onCreateLocation?: (formData: NewLocationFormSchema) => Promise<Key | null>;
  showAddress?: boolean;
  isPreselected?: boolean;
}

export function renderLocation(
  { name, city, state, address }: Location,
  { showAddress = false }: { showAddress?: boolean } = {},
) {
  return (
    <div className="flex flex-col">
      <span className="font-medium">{name}</span>
      <span className="text-xs text-default-500">
        {city}
        {state ? `, ${state}` : ""}
      </span>
      {showAddress && address && <span className="text-tiny text-default-400">{address}</span>}
    </div>
  );
}

export default function LocationSelector<T extends FieldValues>({
  className,
  locations,
  control,
  name,
  label,
  onCreateLocation,
  showAddress = false,
  isPreselected = false,
}: LocationSelectorProps<T>) {
  const { field, fieldState } = useController<T>({
    control,
    name,
  });

  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationCity, setNewLocationCity] = useState("");
  const [newLocationState, setNewLocationState] = useState("");
  const [newLocationAddress, setNewLocationAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const lastAddedLocationId = useRef<Key | undefined>(undefined);

  const resetForm = useCallback(() => {
    setNewLocationName("");
    setNewLocationCity("");
    setNewLocationState("");
    setNewLocationAddress("");
    setShowCreateLocation(false);
  }, []);

  useEffect(() => {
    if (
      lastAddedLocationId.current &&
      locations.find(location => location.id === lastAddedLocationId.current)
    ) {
      field.onChange(lastAddedLocationId.current);
      resetForm();
      setIsLoading(false);
      lastAddedLocationId.current = undefined;
    }
  }, [field, locations, resetForm]);

  const handleCreateLocation = useCallback(async () => {
    if (!onCreateLocation) return;

    setIsLoading(true);
    const newLocationId = await onCreateLocation({
      name: newLocationName,
      city: newLocationCity,
      state: newLocationState || undefined,
      address: newLocationAddress || undefined,
    });

    if (newLocationId !== null) {
      lastAddedLocationId.current = newLocationId;
    }
  }, [onCreateLocation, newLocationName, newLocationCity, newLocationState, newLocationAddress]);

  const canSubmit = newLocationName.length > 0 && newLocationCity.length > 0;

  if (isPreselected) {
    return (
      <Select
        ref={field.ref}
        name={field.name}
        onBlur={field.onBlur}
        selectedKeys={field.value ? [field.value] : []}
        onChange={field.onChange}
        label="Location"
        isDisabled
        items={locations}
        className={className}
      >
        {item => <SelectItem key={item.id}>{item.name}</SelectItem>}
      </Select>
    );
  }

  return (
    <div
      className={cn("flex gap-2 items-center justify-center flex-wrap sm:flex-nowrap", className)}
    >
      {!showCreateLocation && (
        <Autocomplete
          ref={field.ref}
          name={field.name}
          onBlur={field.onBlur}
          selectedKey={field.value ?? null}
          onSelectionChange={field.onChange}
          label={label}
          placeholder="Search locations..."
          defaultItems={locations}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          isClearable
        >
          {item => (
            <AutocompleteItem
              key={item.id}
              textValue={`${item.name} (${item.city}${item.state ? `, ${item.state}` : ""})`}
            >
              {renderLocation(item, { showAddress })}
            </AutocompleteItem>
          )}
        </Autocomplete>
      )}
      {!!onCreateLocation &&
        (showCreateLocation ? (
          <div className="flex flex-col gap-2 w-full">
            <Input
              autoFocus
              value={newLocationName}
              onValueChange={setNewLocationName}
              label="Location Name"
              isRequired
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                value={newLocationCity}
                onValueChange={setNewLocationCity}
                label="City"
                isRequired
              />
              <Input value={newLocationState} onValueChange={setNewLocationState} label="State" />
            </div>
            {showAddress && (
              <Input
                value={newLocationAddress}
                onValueChange={setNewLocationAddress}
                label="Address"
              />
            )}
            <ButtonGroup variant="flat">
              <Button
                color="success"
                isDisabled={!canSubmit}
                onPress={handleCreateLocation}
                isLoading={isLoading}
              >
                Save
              </Button>
              <Button color="danger" onPress={resetForm}>
                Cancel
              </Button>
            </ButtonGroup>
          </div>
        ) : (
          <Button
            isDisabled={!!field.value}
            color="success"
            variant="flat"
            className="shrink-0"
            onPress={() => setShowCreateLocation(true)}
            startContent={<PlusIcon size={16} />}
          >
            Add New Location
          </Button>
        ))}
    </div>
  );
}
