import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { addToast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, UserCirclePlusIcon } from "@phosphor-icons/react";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/FormInput";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { PositionSelect } from "@/components/PositionSelect";

import { createPlayerForTeam } from "../../../actions";
import { createPlayerFormSchema } from "../../../forms";

import type { CreatePlayerFormSchema } from "../../../forms";

interface NewPlayerFormProps {
  teamId: string;
  defaultNameValue: string;
  onCancel: () => void;
}

export default function NewPlayerForm({ teamId, defaultNameValue, onCancel }: NewPlayerFormProps) {
  const {
    register,
    getValues,
    formState: { isValid, errors },
  } = useForm<CreatePlayerFormSchema>({
    resolver: zodResolver(createPlayerFormSchema),
    defaultValues: {
      teamId,
      name: defaultNameValue,
      primaryPosition: undefined,
      secondaryPosition: undefined,
      jerseyNumber: undefined,
      nickname: undefined,
    },
    mode: "onTouched",
  });

  const [createPlayerState, createPlayerAction, isPending] = useActionState(
    createPlayerForTeam,
    null,
  );

  useEffect(() => {
    if (createPlayerState?.status === "error") {
      addToast({
        title: "Error creating player",
        description: createPlayerState.message,
        color: "danger",
      });
    }
  }, [createPlayerState]);

  return (
    <Card shadow="sm">
      <CardHeader className="p-4">
        <div className="w-full flex items-center justify-between">
          <h3 className="text-lg font-semibold">New Player</h3>
          <Button
            type="button"
            variant="flat"
            color="danger"
            startContent={<ArrowLeftIcon size={16} weight="duotone" />}
            onPress={onCancel}
          >
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-4 pt-0">
        <form
          className="flex flex-col gap-6"
          onSubmit={e => {
            e.preventDefault();
            startTransition(() => {
              createPlayerAction(getValues());
            });
          }}
        >
          <input type="hidden" {...register("teamId")} value={teamId} />
          <FormInput
            label="Name"
            isRequired
            errorMessage={errors.name?.message}
            {...register("name")}
          />
          <div className="flex gap-2">
            <PositionSelect
              label="Position"
              isRequired
              errorMessage={errors.primaryPosition?.message}
              {...register("primaryPosition", {
                setValueAs: value => value || undefined,
              })}
            />
            <PositionSelect
              label="Backup Position"
              errorMessage={errors.secondaryPosition?.message}
              {...register("secondaryPosition", {
                setValueAs: value => value || undefined,
              })}
            />
          </div>
          <div className="flex gap-2">
            <FormInput
              label="Jersey Number"
              errorMessage={errors.jerseyNumber?.message}
              {...register("jerseyNumber")}
            />
            <FormInput
              label="Nickname"
              errorMessage={errors.nickname?.message}
              {...register("nickname")}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <FormSubmitButton
              isValid={isValid}
              isLoading={isPending}
              variant="flat"
              color="primary"
              startContent={<UserCirclePlusIcon size={16} weight="duotone" />}
            >
              Create Player
            </FormSubmitButton>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
