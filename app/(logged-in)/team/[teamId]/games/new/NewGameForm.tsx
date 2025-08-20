"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { DatePicker } from "@heroui/date-picker";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Tab, Tabs } from "@heroui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLocalTimeZone, now, today } from "@internationalized/date";
import { BaseballIcon, TrophyIcon } from "@phosphor-icons/react";
import { DateTime } from "luxon";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert } from "@/components/Alert";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { formatDateRange } from "@/utils/display";

import { newGameFormSchema } from "../../../forms";
import { createGame, createSoloModeTeam } from "./actions";
import TeamSelector from "./TeamSelector";

import type { PostgrestError } from "@supabase/supabase-js";
import type { NewGameFormSchema } from "../../../forms";
import type { NewGamePageOpponent, NewGamePageTournament } from "../../../queries";

interface Props {
  teamId: string;
  tournamentId?: string;
  opponentTeams: NewGamePageOpponent[];
  tournaments: NewGamePageTournament[];
}

function getDefaultGameTime() {
  return now(getLocalTimeZone()).add({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 });
}

function renderTournament({
  name,
  location,
  location_city,
  location_state,
  start_date,
  end_date,
}: NewGamePageTournament) {
  const locationData = location || { city: location_city!, state: location_state };
  const locationString = locationData.state
    ? `${locationData.city}, ${locationData.state}`
    : locationData.city;

  // Format dates using Luxon and formatDateRange for better readability
  const start = DateTime.fromISO(start_date);
  const end = DateTime.fromISO(end_date);
  const dateString = start.isValid && end.isValid ? formatDateRange({ start, end }) : "";

  return (
    <div className="flex flex-col" key={name}>
      <span>
        {name}
        {locationString && <span className="text-tiny text-default-500"> ({locationString})</span>}
      </span>
      {dateString && <span className="text-tiny text-default-400">{dateString}</span>}
    </div>
  );
}

export default function NewGameForm({ teamId, tournamentId, opponentTeams, tournaments }: Props) {
  const {
    register,
    control,
    formState: { errors, isValid },
    getValues,
  } = useForm<NewGameFormSchema>({
    resolver: zodResolver(newGameFormSchema),
    defaultValues: { teamId, tournamentId, role: "away", scheduledStartTime: getDefaultGameTime() },
  });

  const [trackOpponentAtBats, setTrackOpponentAtBats] = useState(true);

  const [state, formAction] = useActionState(createGame, null);
  const [newTeamError, setNewTeamError] = useState<PostgrestError | null>(null);

  return (
    <form className="flex flex-col gap-4" action={() => formAction(getValues())}>
      <Card shadow="none" className="border border-divider">
        <CardHeader className="pb-0">
          <h3 className="font-medium">Tournament</h3>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
            <Select
              aria-label="Select a tournament"
              placeholder="Select a tournament"
              items={tournaments}
              listboxProps={{
                emptyContent: "No tournaments",
              }}
              classNames={{ trigger: "h-14" }}
              renderValue={selectedItems => {
                const selectedTournament = selectedItems[0];
                if (!selectedTournament) return null;
                return renderTournament(selectedTournament.data!);
              }}
              {...register("tournamentId")}
            >
              {item => <SelectItem key={item.id}>{renderTournament(item)}</SelectItem>}
            </Select>
            <Button
              variant="flat"
              color="primary"
              as={Link}
              href={`/team/${teamId}/tournaments/new?from=new-game`}
              startContent={<TrophyIcon size={20} weight="duotone" />}
              className="shrink-0"
            >
              Create Tournament
            </Button>
          </div>
        </CardBody>
      </Card>
      <Card shadow="none" className="border border-divider">
        <CardHeader className="pb-0 justify-between">
          <h3 className="font-medium">Game Details</h3>
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
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <Input
            {...register("name")}
            label="Game Name (optional)"
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
          />
          <Controller
            control={control}
            name="scheduledStartTime"
            render={({ field: { onChange, value, ...field } }) => (
              <DatePicker
                label="Game Time"
                value={value}
                onChange={onChange}
                {...field}
                minValue={today(getLocalTimeZone())}
                hideTimeZone
              />
            )}
          />
        </CardBody>
      </Card>
      <Card shadow="none" className="border border-divider">
        <CardHeader className="pb-0">
          <h3 className="font-medium">Opponent</h3>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <TeamSelector
            teams={opponentTeams}
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
            <Checkbox
              aria-label="Track opponent at-bats"
              isSelected={trackOpponentAtBats}
              onValueChange={setTrackOpponentAtBats}
            >
              Track opponent at-bats
            </Checkbox>
            <span className="text-tiny text-default-500">
              If unselected, only runs per inning will be tracked for the opposing team.
            </span>
          </div>
        </CardBody>
      </Card>
      {!!newTeamError && <Alert>{newTeamError.message}</Alert>}
      {state?.status === "error" && <Alert>{state.message}</Alert>}
      <FormSubmitButton
        isValid={isValid}
        startContent={<BaseballIcon size={20} weight="duotone" />}
      >
        Create Game
      </FormSubmitButton>
    </form>
  );
}
