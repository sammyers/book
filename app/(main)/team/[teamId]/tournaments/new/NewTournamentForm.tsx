"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { DateRangePicker } from "@heroui/date-picker";
import { Input } from "@heroui/input";
import { addToast, Tab, Tabs } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLocalTimeZone, today } from "@internationalized/date";
import { TrophyIcon } from "@phosphor-icons/react";
import { startTransition, useActionState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormSubmitButton } from "@/components/FormSubmitButton";
import { StickyFooter, StickyFooterContent } from "@/components/StickyFooter";
import { states } from "@/utils/states";

import { makeNewTournamentActionData, newTournamentFormSchema } from "../../../forms";
import LocationSelector from "../../../LocationSelector";
import { createLocation, createTournament } from "./actions";

import type { NewTournamentFormSchema } from "../../../forms";
import type { Location } from "../../../queries";

interface Props {
  teamId: string;
  regionId?: string;
  locations: Location[];
  fromNewGame?: boolean;
}

const tournamentAssociations = [
  { label: "USSSA", value: "USSSA" },
  { label: "GSL", value: "GSL" },
  { label: "NCS", value: "NCS" },
  { label: "ASA/USA", value: "ASA/USA" },
  { label: "Legacy", value: "Legacy" },
  { label: "Other", value: "Other" },
];

export default function NewTournamentForm({ teamId, regionId, locations, fromNewGame }: Props) {
  const {
    register,
    control,
    watch,
    formState: { errors, isValid },
    getValues,
  } = useForm<NewTournamentFormSchema>({
    resolver: zodResolver(newTournamentFormSchema),
    defaultValues: {
      teamId,
      regionId,
      dateRange: {
        start: today(getLocalTimeZone()),
        end: today(getLocalTimeZone()),
      },
      location: {
        type: "single_location",
      },
    },
  });

  const locationType = watch("location.type");

  const [formState, formAction, isLoading] = useActionState(createTournament, null);

  useEffect(() => {
    if (formState?.status === "error") {
      addToast({
        title: "Error creating tournament",
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
          formAction(makeNewTournamentActionData(getValues(), fromNewGame));
        });
      }}
    >
      <input type="hidden" {...register("regionId")} />
      <Card shadow="none" className="border border-divider">
        <CardHeader className="pb-0">
          <h3 className="font-medium">Tournament Details</h3>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              {...register("name")}
              label="Tournament Name"
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
            />
            <Select
              {...register("association")}
              label="Association"
              isInvalid={!!errors.association}
              errorMessage={errors.association?.message}
              items={tournamentAssociations}
            >
              {item => <SelectItem key={item.value}>{item.label}</SelectItem>}
            </Select>
          </div>
          <Controller
            control={control}
            name="dateRange"
            render={({ field: { onChange, value, ...field } }) => (
              <DateRangePicker
                aria-label="Date Range"
                label="Dates"
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
        <CardHeader className="pb-0 justify-between">
          <h3 className="font-medium">Location</h3>
          <Controller
            control={control}
            name="location.type"
            render={({ field: { onChange, value } }) => (
              <Tabs onSelectionChange={onChange} selectedKey={value}>
                <Tab key="single_location" title="One Complex" />
                <Tab key="multiple_locations" title="Multiple" />
              </Tabs>
            )}
          />
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          {locationType === "single_location" ? (
            <LocationSelector
              showAddress
              locations={locations}
              control={control}
              name="location.locationId"
              label="Complex"
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
            />
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-default-500">
                Enter the primary location where the tournament will be held.
              </p>
              <div className="flex gap-2">
                <Input label="City" isRequired {...register("location.city")} />
                <Select label="State" items={states} {...register("location.state")}>
                  {item => <SelectItem key={item.value}>{item.label}</SelectItem>}
                </Select>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
      <StickyFooter>
        <StickyFooterContent>
          <FormSubmitButton
            isValid={isValid}
            isLoading={isLoading}
            startContent={<TrophyIcon size={20} weight="duotone" />}
            className="shrink-0 grow"
          >
            Create Tournament
          </FormSubmitButton>
        </StickyFooterContent>
      </StickyFooter>
    </form>
  );
}
