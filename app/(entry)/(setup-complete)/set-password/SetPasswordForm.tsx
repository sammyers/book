"use client";

import { Alert } from "@heroui/alert";
import { CardBody, CardHeader } from "@heroui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { FormSubmitButton } from "@/components/FormSubmitButton";
import { PasswordInput } from "@/components/PasswordInput";

import { setPassword } from "../../actions";
import { setPasswordFormSchema } from "../../forms";

import type { SetPasswordFormSchema } from "../../forms";

interface SetPasswordFormProps {
  userName: string;
}

export default function SetPasswordForm({ userName }: SetPasswordFormProps) {
  const {
    register,
    formState: { isValid, errors },
    getValues,
  } = useForm<SetPasswordFormSchema>({
    resolver: zodResolver(setPasswordFormSchema),
    mode: "onTouched",
  });

  const [state, formAction] = useActionState(setPassword, null);

  return (
    <>
      <CardHeader className="flex flex-col gap-2">
        <h1 className="font-bold text-large">Set Your Password</h1>
        <p className="text-default-500 text-small text-center">
          Welcome, <span className="font-bold">{userName}</span>! Please set a
          password to finish setting up your account.
        </p>
      </CardHeader>
      <form action={() => formAction(getValues())}>
        <CardBody className="gap-6">
          <PasswordInput
            variant="bordered"
            autoFocus
            label="Password"
            {...register("password")}
            errorMessage={errors.password?.message}
          />
          {state?.status === "error" && (
            <Alert color="danger">{state.message}</Alert>
          )}
          <FormSubmitButton isValid={isValid}>Set Password</FormSubmitButton>
        </CardBody>
      </form>
    </>
  );
}
