"use client";

import { Input } from "@heroui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/Alert";
import { FormSubmitButton } from "@/components/FormSubmitButton";

import { newGameFormSchema } from "../../../team/[teamId]/new-game/formSchema";
import { createGame } from "../../actions";
import ExcludeTeamSelector from "./ExcludeTeamSelector";

import type { Tables } from "@/utils/supabase/database.types";
import type { NewGameFormSchema } from "../../../team/[teamId]/new-game/formSchema";

export default function NewGameForm({ teams }: { teams: Tables<"team">[] }) {
  const {
    register,
    control,
    formState: { errors, isValid },
    getValues,
  } = useForm<NewGameFormSchema>({
    resolver: zodResolver(newGameFormSchema),
  });

  const [state, formAction] = useActionState(createGame, null);

  return (
    <form
      className="flex flex-col gap-4"
      action={() => formAction(getValues())}
    >
      <Input
        {...register("name")}
        label="Game Name"
        placeholder="Enter a name"
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message}
      />
      <ExcludeTeamSelector
        teams={teams}
        name="awayTeamId"
        label="Away Team"
        control={control}
      />
      <ExcludeTeamSelector
        teams={teams}
        name="homeTeamId"
        label="Home Team"
        control={control}
      />
      {state?.status === "error" && <Alert>{state.message}</Alert>}
      <FormSubmitButton isValid={isValid}>Start Game</FormSubmitButton>
    </form>
  );
}
