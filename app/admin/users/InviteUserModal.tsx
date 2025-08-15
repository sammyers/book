"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { addToast } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnvelopeSimpleIcon, UserPlusIcon } from "@phosphor-icons/react";
import { startTransition, useActionState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";

import { FormSubmitButton } from "@/components/FormSubmitButton";

import { inviteUser } from "../actions";
import { inviteUserSchema } from "../forms";

import type { Team } from "../adminPageQueries";
import type { InviteUserSchema } from "../forms";

interface Props {
  teams: Team[];
}

export default function InviteUserModal({ teams }: Props) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const {
    register,
    getValues,
    formState: { isValid, errors },
    reset,
  } = useForm<InviteUserSchema>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      teamId: "",
      permissionLevel: "member",
    },
    mode: "onTouched",
  });

  const [formState, formAction] = useActionState(inviteUser, null);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    if (formState?.status === "error") {
      addToast({
        title: "Error",
        description: formState.message,
        color: "danger",
      });
    }

    if (formState?.status === "success") {
      handleClose();
      addToast({
        title: "User invited",
        description: "Invitation email has been sent and user added to team",
        color: "success",
      });
    }
  }, [formState, handleClose]);

  return (
    <>
      <Button
        color="primary"
        variant="flat"
        startContent={<UserPlusIcon size={16} />}
        className="shrink-0"
        onPress={onOpen}
      >
        Invite User
      </Button>
      <Modal
        size="2xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        hideCloseButton
        isKeyboardDismissDisabled
        classNames={{
          wrapper: "overflow-y-auto flex-col",
          base: "overflow-y-visible",
        }}
      >
        <ModalContent>
          <ModalHeader>Invite New User</ModalHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(() => formAction(getValues()));
            }}
          >
            <ModalBody>
              <Card shadow="none" className="border border-divider">
                <CardHeader>
                  <h3 className="font-medium">User Information</h3>
                </CardHeader>
                <CardBody className="flex flex-col gap-2 pt-0">
                  <Input
                    label="Email Address"
                    isRequired
                    type="email"
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                    {...register("email")}
                  />
                  <div className="flex gap-2">
                    <Input
                      label="First Name"
                      isRequired
                      isInvalid={!!errors.firstName}
                      errorMessage={errors.firstName?.message}
                      {...register("firstName")}
                    />
                    <Input
                      label="Last Name"
                      isRequired
                      isInvalid={!!errors.lastName}
                      errorMessage={errors.lastName?.message}
                      {...register("lastName")}
                    />
                  </div>
                  <p className="text-sm text-default-500">
                    An invitation email will be sent to the user with
                    instructions to join the platform.
                  </p>
                </CardBody>
              </Card>
              <Card shadow="none" className="border border-divider">
                <CardHeader>
                  <h3 className="font-medium">Team Assignment</h3>
                </CardHeader>
                <CardBody className="flex flex-col gap-2 pt-0">
                  <Select
                    label="Team"
                    items={teams}
                    isRequired
                    placeholder="Select a team"
                    isInvalid={!!errors.teamId}
                    errorMessage={errors.teamId?.message}
                    {...register("teamId")}
                  >
                    {(team) => (
                      <SelectItem key={team.id} description={team.admin_note}>
                        {team.name}
                      </SelectItem>
                    )}
                  </Select>
                  <Select
                    label="Permission Level"
                    items={[
                      { key: "member", label: "Member" },
                      { key: "scorekeeper", label: "Scorekeeper" },
                      { key: "manager", label: "Manager" },
                    ]}
                    isRequired
                    placeholder="Select permission level"
                    isInvalid={!!errors.permissionLevel}
                    errorMessage={errors.permissionLevel?.message}
                    {...register("permissionLevel")}
                  >
                    {(item) => (
                      <SelectItem key={item.key}>{item.label}</SelectItem>
                    )}
                  </Select>
                  <p className="text-sm text-default-500">
                    The user will be automatically added to the selected team
                    with the specified permission level.
                  </p>
                </CardBody>
              </Card>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <FormSubmitButton
                variant="flat"
                isValid={isValid}
                startContent={
                  <EnvelopeSimpleIcon
                    size={20}
                    weight="duotone"
                    className="shrink-0"
                  />
                }
              >
                Send Invitation
              </FormSubmitButton>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
