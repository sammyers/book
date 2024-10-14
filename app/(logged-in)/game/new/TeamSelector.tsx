"use client";

import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useMemo } from "react";
import { useController, useWatch } from "react-hook-form";

import type { Tables } from "@/utils/supabase/database.types";
import type { Control } from "react-hook-form";
import type { NewGameFormSchema } from "./formSchema";

interface TeamSelectorProps {
  teams: Tables<"team">[];
  control: Control<NewGameFormSchema>;
  name: "awayTeamId" | "homeTeamId";
  label: string;
}

export default function TeamSelector({
  teams,
  control,
  name,
  label,
}: TeamSelectorProps) {
  const { field, fieldState } = useController<NewGameFormSchema>({
    control,
    name,
  });

  const otherTeamId = useWatch({
    control,
    name: name === "awayTeamId" ? "homeTeamId" : "awayTeamId",
    defaultValue: "",
  });

  const options = useMemo(
    () => teams.filter((team) => team.id !== otherTeamId),
    [teams, otherTeamId],
  );

  console.log({ name, field });

  return (
    <Autocomplete
      ref={field.ref}
      name={field.name}
      onBlur={field.onBlur}
      value={field.value}
      selectedKey={field.value}
      onSelectionChange={field.onChange}
      label={label}
      placeholder="Search teams"
      defaultItems={options}
      isInvalid={!!fieldState.error}
      errorMessage={fieldState.error?.message}
    >
      {(item) => (
        <AutocompleteItem key={item.id} value={item.id} textValue={item.name}>
          {item.name}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
