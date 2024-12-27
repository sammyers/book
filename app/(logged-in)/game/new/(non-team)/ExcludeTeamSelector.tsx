"use client";

import { useMemo } from "react";
import { useWatch } from "react-hook-form";

import TeamSelector from "../TeamSelector";

import type { NewGameFormSchema } from "../formSchema";
import type { TeamSelectorProps } from "../TeamSelector";

type ExcludeTeamSelectorProps = TeamSelectorProps<NewGameFormSchema>;

export default function ExcludeTeamSelector({
  teams,
  control,
  name,
  label,
}: ExcludeTeamSelectorProps) {
  const otherTeamId = useWatch({
    control,
    name: name === "awayTeamId" ? "homeTeamId" : "awayTeamId",
    defaultValue: "",
  });

  const options = useMemo(
    () => teams.filter((team) => team.id !== otherTeamId),
    [teams, otherTeamId],
  );

  return (
    <TeamSelector teams={options} control={control} name={name} label={label} />
  );
}
