"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button, ButtonGroup } from "@heroui/button";
import { Input } from "@heroui/input";
import { PlusIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useController } from "react-hook-form";

import type { Key } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import type { NewLocationFormSchema } from "./forms";
import type { Location } from "./queries";

export interface LocationSelectorProps<T extends FieldValues> {
  locations: Location[];
  control: Control<T>;
  name: Path<T>;
  label: string;
  onCreateLocation?: (formData: NewLocationFormSchema) => Promise<Key | null>;
  showAddress?: boolean;
}

export default function LocationSelector<T extends FieldValues>({
  locations,
  control,
  name,
  label,
  onCreateLocation,
  showAddress = false,
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

  const handleCreateLocation = async () => {
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
  };

  const canSubmit = newLocationName.length > 0 && newLocationCity.length > 0;

  return (
    <div className="flex gap-2 items-center justify-center flex-wrap sm:flex-nowrap">
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
              textValue={`${item.name} - ${item.city}${item.state ? `, ${item.state}` : ""}`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-default-500">
                  {item.city}
                  {item.state ? `, ${item.state}` : ""}
                </span>
                {item.address && <span className="text-tiny text-default-400">{item.address}</span>}
              </div>
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
