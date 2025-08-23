"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { DatePicker } from "@heroui/date-picker";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Tab, Tabs } from "@heroui/tabs";
import { addToast } from "@heroui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getLocalTimeZone,
  now,
  parseAbsoluteToLocal,
  parseDate,
  Time,
  toCalendarDateTime,
  today,
  toZoned,
} from "@internationalized/date";
import { BaseballIcon, TrophyIcon } from "@phosphor-icons/react";
import { DateTime } from "luxon";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormSubmitButton } from "@/components/FormSubmitButton";
import { StickyFooter, StickyFooterContent } from "@/components/StickyFooter";
import { formatDateRange } from "@/utils/display";
import { useFlashToast } from "@/utils/hooks/useFlashToast";

import { makeNewGameFormActionData, newGameFormSchema } from "../../../forms";
import LocationSelector from "../../../LocationSelector";
import { createLocation } from "../../tournaments/new/actions";
import { createSoloModeTeam, createTournamentGame } from "./actions";
import TeamSelector from "./TeamSelector";

import type { ZonedDateTime } from "@internationalized/date";
import type { NewGameFormSchema } from "../../../forms";
import type {
  NewGamePageLocation,
  NewGamePageOpponent,
  NewGamePageTournament,
} from "../../../queries";

interface Props {
  teamId: string;
  tournamentId?: string;
  latestGameTime?: string;
  opponentTeams: NewGamePageOpponent[];
  tournaments: NewGamePageTournament[];
  locations: NewGamePageLocation[];
}

function getDefaultGameTime(
  selectedTournament?: NewGamePageTournament | null,
  latestGameTime?: string,
) {
  const timeZone = getLocalTimeZone();
  const nowTime = now(timeZone);
  const topOfNextHour = nowTime.add({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 });
  // If no tournament is preselected, return the top of the next hour
  if (!selectedTournament) {
    return topOfNextHour;
  }

  // If a tournament is preselected, calculate the latest of:
  // 1. 8am on the first day of the tournament
  // 2. The latest game time if defined
  // 3. The top of the next hour after the current time

  // 8am on the first day of the tournament
  const tournamentStartDate = parseDate(selectedTournament.start_date);
  const eightAmTournamentStart = toZoned(
    toCalendarDateTime(tournamentStartDate, new Time(8)),
    timeZone,
  );

  // Latest game time if defined
  let latestGameDateTime: ZonedDateTime | null = null;
  if (latestGameTime) {
    latestGameDateTime = parseAbsoluteToLocal(latestGameTime);
  }

  // Find the latest time among the three options
  const candidates = [topOfNextHour, eightAmTournamentStart];
  if (latestGameDateTime) {
    candidates.push(latestGameDateTime.add({ hours: 1 }));
  }

  const latestTime = candidates.reduce((latest, current) =>
    current.compare(latest) > 0 ? current : latest,
  );

  return latestTime;
}

function renderTournament({
  name,
  location,
  location_city,
  location_state,
  start_date,
  end_date,
  association,
}: NewGamePageTournament) {
  const locationData = location || { city: location_city!, state: location_state };
  const locationString = locationData.state
    ? `${locationData.city}, ${locationData.state}`
    : locationData.city;

  // Format dates using Luxon and formatDateRange for better readability
  const start = DateTime.fromISO(start_date);
  const end = DateTime.fromISO(end_date);
  const dateString = formatDateRange({ start, end });

  return (
    <div className="flex flex-col gap-1" key={name}>
      <div className="flex items-center gap-1">
        <span>{name}</span>
        {locationString && (
          <span className="text-tiny text-default-500 pt-px"> ({locationString})</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-tiny text-default-400">{dateString}</span>
        {association && (
          <>
            <span className="text-tiny text-default-400">•</span>
            <span className="text-tiny text-default-400">{association}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function NewGameForm({
  teamId,
  tournamentId: initialTournamentId,
  latestGameTime,
  opponentTeams,
  tournaments,
  locations,
}: Props) {
  useFlashToast();

  const [initialTournament, initialLocationId] = useMemo(() => {
    const selectedTournament = tournaments.find(
      tournament => tournament.id === initialTournamentId,
    );
    if (!selectedTournament) return [null, null] as const;
    const selectedLocationId = selectedTournament.location?.id ?? null;
    return [selectedTournament, selectedLocationId] as const;
  }, [tournaments, initialTournamentId]);

  const {
    register,
    control,
    watch,
    formState: { errors, isValid },
    getValues,
    setValue,
  } = useForm<NewGameFormSchema>({
    resolver: zodResolver(newGameFormSchema),
    defaultValues: {
      teamId,
      tournamentId: initialTournamentId,
      locationId: initialLocationId ?? undefined,
      role: "away",
      scheduledStartTime: getDefaultGameTime(initialTournament, latestGameTime),
      createAnotherGame: false,
      trackOpponentAtBats: true,
    },
  });

  const selectedTournamentId = watch("tournamentId");

  const selectedTournament = useMemo(() => {
    return tournaments.find(tournament => tournament.id === selectedTournamentId);
  }, [tournaments, selectedTournamentId]);

  const [minGameDate, maxGameDate] = useMemo(() => {
    if (!selectedTournament) return [today(getLocalTimeZone()), undefined] as const;
    const startDate = parseDate(selectedTournament.start_date);
    // Allow for games that start after midnight
    const endDate = parseDate(selectedTournament.end_date).add({ days: 1 });
    return [startDate, endDate] as const;
  }, [selectedTournament]);

  useEffect(() => {
    if (selectedTournament) {
      setValue("scheduledStartTime", getDefaultGameTime(selectedTournament, latestGameTime));
    }
  }, [selectedTournament, latestGameTime, setValue]);

  const selectedTournamentLocationId = selectedTournament?.location?.id ?? null;

  useEffect(() => {
    if (selectedTournamentLocationId) {
      setValue("locationId", selectedTournamentLocationId);
    } else {
      setValue("locationId", undefined);
    }
  }, [selectedTournamentLocationId, setValue]);

  const [formState, formAction, isPending] = useActionState(createTournamentGame, null);

  useEffect(() => {
    if (formState?.status === "error") {
      addToast({
        title: "Error creating game",
        description: formState.message,
        color: "danger",
      });
    }
  }, [formState]);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={e => {
        e.preventDefault();
        startTransition(() => {
          formAction(makeNewGameFormActionData(getValues()));
        });
      }}
    >
      <input type="hidden" {...register("teamId")} />
      <Card shadow="none" className="border border-divider">
        <CardHeader className="pb-0">
          <h3 className="font-medium">Tournament</h3>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
            <Select
              {...register("tournamentId")}
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
            >
              {item => (
                <SelectItem key={item.id} textValue={item.name}>
                  {renderTournament(item)}
                </SelectItem>
              )}
            </Select>
            <Button
              variant="flat"
              color="primary"
              as={Link}
              href={`/team/${teamId}/tournaments/new?from=new-game`}
              startContent={<TrophyIcon size={20} weight="duotone" />}
              className="shrink-0"
              isDisabled={!!selectedTournamentId}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <LocationSelector
              isPreselected={!!selectedTournamentLocationId}
              locations={locations}
              control={control}
              name="locationId"
              label="Location"
              onCreateLocation={async formData => {
                const [newLocationId, error] = await createLocation(formData, teamId);
                if (newLocationId) {
                  return newLocationId;
                } else {
                  addToast({
                    title: "Error creating location",
                    description: error?.message,
                    color: "danger",
                  });
                  return null;
                }
              }}
              className={!selectedTournamentLocationId ? "sm:col-span-2" : ""}
            />
            <Input
              {...register("fieldName")}
              label="Field"
              isInvalid={!!errors.fieldName}
              errorMessage={errors.fieldName?.message}
            />
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
                  minValue={minGameDate}
                  maxValue={maxGameDate}
                  hideTimeZone
                  className={!selectedTournamentLocationId ? "sm:col-span-2" : ""}
                />
              )}
            />
          </div>
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
                addToast({
                  title: "Error creating team",
                  description: error?.message,
                  color: "danger",
                });
                return null;
              }
            }}
          />
          <div className="flex flex-col gap-1">
            <Checkbox aria-label="Track opponent at-bats" {...register("trackOpponentAtBats")}>
              Track opponent at-bats
            </Checkbox>
            <span className="text-tiny text-default-500">
              If unselected, only runs per inning will be tracked for the opposing team.
            </span>
          </div>
        </CardBody>
      </Card>
      <StickyFooter>
        <StickyFooterContent>
          <div className="flex flex-col gap-1">
            <Checkbox aria-label="Create another game" {...register("createAnotherGame")}>
              Create another game for this tournament
            </Checkbox>
            <span className="text-tiny text-default-500">
              If unselected, you will be redirected to the newly created game.
            </span>
          </div>
          <FormSubmitButton
            isValid={isValid}
            startContent={<BaseballIcon size={20} weight="duotone" />}
            className="shrink-0 grow"
            isLoading={isPending}
          >
            Create Game
          </FormSubmitButton>
        </StickyFooterContent>
      </StickyFooter>
    </form>
  );
}
