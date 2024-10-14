"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nextui-org/button";
import { CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Link } from "@nextui-org/link";
import { useFormState } from "react-dom";
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
  } = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerFormSchema),
    mode: "onTouched",
  });

  const [state, formAction] = useFormState(registerUser, null);

  return (
    <>
      <CardHeader>
        <h1>Sign up</h1>
      </CardHeader>
      <form action={formAction}>
        <CardBody className="gap-6">
          <div className="flex gap-4">
            <FormInput
              autoFocus
              label="First Name"
              {...register("firstName")}
              errorMessage={errors.firstName?.message}
            />
            <FormInput
              label="Last Name"
              {...register("lastName")}
              errorMessage={errors.lastName?.message}
            />
          </div>
          <FormInput
            type="email"
            label="Email"
            {...register("email")}
            errorMessage={errors.email?.message}
          />
          <PasswordInput
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
        <Button as={Link} href="/login">
          Sign In
        </Button>
      </CardFooter>
    </>
  );
}
