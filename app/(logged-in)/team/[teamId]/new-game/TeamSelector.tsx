"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button, ButtonGroup } from "@heroui/button";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { useEffect, useRef, useState } from "react";
import { useController } from "react-hook-form";

import type { Tables } from "@/utils/supabase/database.types";
import type { Key } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

export interface TeamSelectorProps<T extends FieldValues> {
  teams: Tables<"team">[];
  control: Control<T>;
  name: Path<T>;
  label: string;
  onCreateTeam?: (textValue: string) => Promise<Key | null>;
}

export default function TeamSelector<T extends FieldValues>({
  teams,
  control,
  name,
  label,
  onCreateTeam,
}: TeamSelectorProps<T>) {
  const { field, fieldState } = useController<T>({
    control,
    name,
  });

  const [showCreateOpponent, setShowCreateOpponent] = useState(false);
  const [newOpponentName, setNewOpponentName] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const lastAddedTeamId = useRef<Key | undefined>(undefined);

  useEffect(() => {
    if (
      lastAddedTeamId.current &&
      teams.find((team) => team.id === lastAddedTeamId.current)
    ) {
      field.onChange(lastAddedTeamId.current);
      setNewOpponentName("");
      setShowCreateOpponent(false);
      setisLoading(false);
      lastAddedTeamId.current = undefined;
    }
  }, [field, teams]);

  return (
    <div className="flex gap-3 items-end flex-wrap sm:flex-nowrap">
      {!showCreateOpponent && (
        <Autocomplete
          ref={field.ref}
          name={field.name}
          onBlur={field.onBlur}
          selectedKey={field.value ?? null}
          onSelectionChange={field.onChange}
          label={label}
          placeholder="Search teams"
          defaultItems={teams}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
        >
          {(item) => (
            <AutocompleteItem key={item.id} textValue={item.name}>
              {item.name}
            </AutocompleteItem>
          )}
        </Autocomplete>
      )}
      {!!onCreateTeam &&
        (showCreateOpponent ? (
          <>
            <Input
              autoFocus
              value={newOpponentName}
              onValueChange={setNewOpponentName}
              label="New Opponent"
              placeholder="Enter a team name"
              endContent={
                isLoading ? <Spinner color="default" size="sm" /> : undefined
              }
            />
            <ButtonGroup variant="flat">
              <Button
                color="success"
                isDisabled={newOpponentName.length === 0}
                onPress={async () => {
                  setisLoading(true);
                  const newTeamId = await onCreateTeam(newOpponentName);
                  if (newTeamId !== null) {
                    lastAddedTeamId.current = newTeamId;
                  }
                }}
              >
                Save
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  setShowCreateOpponent(false);
                  setNewOpponentName("");
                }}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </>
        ) : (
          <Button
            color="success"
            variant="flat"
            className="shrink-0"
            onPress={() => setShowCreateOpponent(true)}
          >
            Add New Opponent
          </Button>
        ))}
    </div>
  );
}
