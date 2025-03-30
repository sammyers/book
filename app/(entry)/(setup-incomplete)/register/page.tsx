"use client";

import { Button } from "@heroui/button";
import { CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/Alert";
import { FormInput } from "@/components/FormInput";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { PasswordInput } from "@/components/PasswordInput";

import { registerUser } from "../../actions";
import { registerFormSchema } from "./formSchema";

import type { RegisterFormSchema } from "./formSchema";

export default function RegisterPage() {
  const {
    register,
    // TODO: handle server side errors
    formState: { isValid, errors },
    getValues,
  } = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerFormSchema),
    mode: "onTouched",
  });

  const [state, formAction] = useActionState(registerUser, null);

  return (
    <>
      <CardHeader>
        <h1>Sign Up</h1>
      </CardHeader>
      <form action={() => formAction(getValues())}>
        <CardBody className="gap-6">
          <div className="flex gap-4">
            <FormInput
              variant="bordered"
              autoFocus
              label="First Name"
              {...register("firstName")}
              errorMessage={errors.firstName?.message}
            />
            <FormInput
              variant="bordered"
              label="Last Name"
              {...register("lastName")}
              errorMessage={errors.lastName?.message}
            />
          </div>
          <FormInput
            variant="bordered"
            type="email"
            label="Email"
            {...register("email")}
            errorMessage={errors.email?.message}
          />
          <PasswordInput
            variant="bordered"
            label="Password"
            {...register("password")}
            errorMessage={errors.password?.message}
          />
          {state?.status === "error" && <Alert>{state.message}</Alert>}
          <FormSubmitButton isValid={isValid}>Register</FormSubmitButton>
        </CardBody>
      </form>
      <Divider className="mt-4 mb-2" />
      <CardFooter className="flex flex-col gap-4 items-stretch">
        <h3 className="text-small text-center">Already have an account?</h3>
        <Button as={Link} href="/login" variant="bordered">
          Sign In
        </Button>
      </CardFooter>
    </>
  );
}
