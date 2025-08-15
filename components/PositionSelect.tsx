"use client";

import { Select, SelectItem } from "@heroui/select";
import { startCase } from "lodash";

import { fieldingPositions } from "@/utils/supabase/database.types";

import type { SelectProps } from "@heroui/select";

const fieldingPositionOptions = fieldingPositions.map((position) => ({
  value: position,
  label: startCase(position),
}));

export function PositionSelect(props: Omit<SelectProps, "children" | "items">) {
  return (
    <Select
      label="Position"
      name="position"
      {...props}
      items={fieldingPositionOptions}
    >
      {({ value, label }) => <SelectItem key={value}>{label}</SelectItem>}
    </Select>
  );
}
