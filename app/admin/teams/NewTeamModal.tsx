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
import { FloppyDiskIcon, PlusIcon } from "@phosphor-icons/react";
import { startTransition, useActionState, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { FormSubmitButton } from "@/components/FormSubmitButton";
import { states } from "@/utils/states";

import { checkUserByEmail, createTeamWithManager } from "../actions";
import { newTeamSchema } from "../forms";

import type { NewTeamSchema } from "../forms";
import type { Region } from "../queries";

export default function NewTeamModal({ regions }: { regions: Region[] }) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [foundUser, setFoundUser] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null>(null);

  const {
    register,
    getValues,
    watch,
    setValue,
    formState: { isValid, errors },
    reset,
  } = useForm<NewTeamSchema>({
    resolver: zodResolver(newTeamSchema),
    defaultValues: {
      name: "",
      description: "",
      city: "",
      state: "",
      regionId: regions[0]?.id,
      manager: {
        email: "",
        type: "existing_user",
        userId: "",
      },
    },
    mode: "onTouched",
  });

  const [formState, formAction] = useActionState(createTeamWithManager, null);

  const managerEmail = watch("manager.email");

  const [managerEmailSettled, setManagerEmailSettled] = useState(false);

  // Check for existing user when email changes
  useEffect(() => {
    setManagerEmailSettled(false);
    const checkEmail = async () => {
      if (!managerEmail || !managerEmail.includes("@")) {
        setFoundUser(null);
        setManagerEmailSettled(true);
        return;
      }

      setIsCheckingEmail(true);
      try {
        const user = await checkUserByEmail(managerEmail);
        setFoundUser(user);

        if (user) {
          // User exists, set the form to use existing user
          setValue(
            "manager",
            {
              email: managerEmail,
              type: "existing_user",
              userId: user.id,
            },
            { shouldValidate: true },
          );
        } else {
          // User doesn't exist, set the form to create new user
          setValue(
            "manager",
            {
              email: managerEmail,
              type: "new_user",
              firstName: "",
              lastName: "",
            },
            { shouldValidate: true },
          );
        }
      } catch (error) {
        setFoundUser(null);
      } finally {
        setIsCheckingEmail(false);
        setManagerEmailSettled(true);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [managerEmail, setValue]);

  const handleClose = useCallback(() => {
    reset();
    setFoundUser(null);
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
        title: "Team created",
        color: "success",
      });
    }
  }, [formState, handleClose]);

  const showAdditionalManagerInfo =
    !foundUser &&
    managerEmail &&
    managerEmail.includes("@") &&
    !isCheckingEmail &&
    managerEmailSettled;

  return (
    <>
      <Button
        color="primary"
        variant="flat"
        startContent={<PlusIcon size={16} />}
        className="shrink-0"
        onPress={onOpen}
      >
        New Team
      </Button>
      <Modal
        size="2xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        hideCloseButton
        isKeyboardDismissDisabled
        classNames={{
          wrapper: "overflow-y-auto flex-col justify-end sm:justify-center items-center",
          base: "overflow-y-visible",
        }}
      >
        <ModalContent>
          <ModalHeader>Create New Team</ModalHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              startTransition(() => {
                formAction(getValues());
              });
            }}
          >
            <ModalBody>
              <Card shadow="none" className="border border-divider">
                <CardHeader className="pb-0">
                  <h3 className="font-medium">Team Information</h3>
                </CardHeader>
                <CardBody className="flex flex-col gap-2">
                  <Input
                    label="Team Name"
                    isRequired
                    {...register("name")}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                  />
                  <Input
                    label="Description"
                    {...register("description")}
                    isInvalid={!!errors.description}
                    errorMessage={errors.description?.message}
                  />
                  <Select
                    label="Region"
                    items={regions}
                    {...register("regionId")}
                    isInvalid={!!errors.regionId}
                    errorMessage={errors.regionId?.message}
                  >
                    {item => <SelectItem key={item.id}>{item.name}</SelectItem>}
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      label="Location"
                      placeholder="City"
                      isRequired
                      {...register("city")}
                      isInvalid={!!errors.city}
                      errorMessage={errors.city?.message}
                    />
                    <Select
                      label="State"
                      items={states}
                      {...register("state")}
                      isInvalid={!!errors.state}
                      errorMessage={errors.state?.message}
                    >
                      {item => <SelectItem key={item.value}>{item.label}</SelectItem>}
                    </Select>
                  </div>
                </CardBody>
              </Card>
              <Card shadow="none" className="border border-divider">
                <CardHeader>
                  <h3 className="font-medium">Team Manager</h3>
                </CardHeader>
                <CardBody className="flex flex-col gap-2 pt-0">
                  <Input
                    label="Manager Email"
                    isRequired
                    type="email"
                    placeholder="Enter manager's email address"
                    isInvalid={!!errors.manager?.email}
                    errorMessage={errors.manager?.email?.message}
                    {...register("manager.email")}
                  />

                  {isCheckingEmail && (
                    <p className="text-sm text-primary-500">Checking if user exists...</p>
                  )}

                  {foundUser && !isCheckingEmail && (
                    <p className="text-sm text-success">
                      ✓ User found: {foundUser.first_name} {foundUser.last_name}
                    </p>
                  )}

                  {showAdditionalManagerInfo && (
                    <div className="flex gap-2">
                      <Input label="First Name" isRequired {...register("manager.firstName")} />
                      <Input label="Last Name" isRequired {...register("manager.lastName")} />
                    </div>
                  )}
                </CardBody>
              </Card>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <FormSubmitButton
                variant="flat"
                isValid={isValid && !isCheckingEmail}
                startContent={<FloppyDiskIcon size={20} weight="duotone" className="shrink-0" />}
              >
                Create Team
              </FormSubmitButton>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
