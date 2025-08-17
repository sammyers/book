"use client";

import { Checkbox } from "@heroui/checkbox";
import { Input } from "@heroui/input";
import { Tab, Tabs } from "@heroui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert } from "@/components/Alert";
import { FormSubmitButton } from "@/components/FormSubmitButton";

import { createGame, createSoloModeTeam } from "./actions";
import { newGameFormSchema } from "./formSchema";
import TeamSelector from "./TeamSelector";

import type { Tables } from "@/utils/supabase/database.types";
import type { PostgrestError } from "@supabase/supabase-js";
import type { NewGameFormSchema } from "./formSchema";

interface Props {
  teamId: string;
  teams: Tables<"team">[];
}

export default function NewGameForm({ teamId, teams }: Props) {
  const {
    register,
    control,
    formState: { errors, isValid },
    getValues,
  } = useForm<NewGameFormSchema>({
    resolver: zodResolver(newGameFormSchema),
    defaultValues: { teamId, role: "away" },
  });

  const [trackOpponentAtBats, setTrackOpponentAtBats] = useState(true);

  const [state, formAction] = useActionState(createGame, null);
  const [newTeamError, setNewTeamError] = useState<PostgrestError | null>(null);

  return (
    <form className="flex flex-col gap-4" action={() => formAction(getValues())}>
      <div className="flex gap-3 items-end flex-wrap sm:flex-nowrap">
        <Input
          {...register("name")}
          label="Game Name"
          isInvalid={!!errors.name}
          errorMessage={errors.name?.message}
        />
        <Controller
          control={control}
          name="role"
          render={({ field: { onChange, value } }) => (
            <Tabs selectedKey={value} onSelectionChange={onChange}>
              <Tab key="away" title="Away" />
              <Tab key="home" title="Home" />
            </Tabs>
          )}
        />
      </div>
      <TeamSelector
        teams={teams}
        name="opponentTeamId"
        label="Choose Opponent"
        control={control}
        onCreateTeam={async name => {
          const [newTeamId, error] = await createSoloModeTeam(name, teamId);
          if (newTeamId) {
            return newTeamId;
          } else {
            setNewTeamError(error);
            return null;
          }
        }}
      />
      <div className="flex flex-col gap-1">
        <Checkbox isSelected={trackOpponentAtBats} onValueChange={setTrackOpponentAtBats}>
          Track opponent at-bats
        </Checkbox>
        <span className="text-tiny text-default-500">
          If unselected, only runs per inning will be tracked for the opposing team.
        </span>
      </div>
      {!!newTeamError && <Alert>{newTeamError.message}</Alert>}
      {state?.status === "error" && <Alert>{state.message}</Alert>}
      <FormSubmitButton isValid={isValid}>Create Game</FormSubmitButton>
    </form>
  );
}
