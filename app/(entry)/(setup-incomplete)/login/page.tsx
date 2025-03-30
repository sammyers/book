"use client";

import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { FormInput } from "@/components/FormInput";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { PasswordInput } from "@/components/PasswordInput";

import { login } from "../../actions";
import { loginFormSchema } from "./formSchema";

import type { LoginFormSchema } from "./formSchema";

export default function LoginPage() {
  const {
    register,
    formState: { isValid, errors },
    getValues,
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
  });

  const [state, formAction] = useActionState(login, null);

  return (
    <>
      <CardHeader>
        <h1>Log In</h1>
      </CardHeader>
      <form action={() => formAction(getValues())}>
        <CardBody className="gap-6">
          <FormInput
            variant="bordered"
            autoFocus
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
          {state?.status === "error" && (
            <Alert color="danger">{state.message}</Alert>
          )}
          <Link color="primary" size="sm" className="self-center">
            Forgot password?
          </Link>
          <FormSubmitButton isValid={isValid}>Sign In</FormSubmitButton>
        </CardBody>
      </form>
      <Divider className="mt-4 mb-2" />
      <CardFooter className="flex flex-col gap-4 items-stretch">
        <h3 className="text-small text-center">
          Don&apos;t have an account yet?
        </h3>
        <Button as={Link} href="/register" variant="bordered">
          Sign Up
        </Button>
      </CardFooter>
    </>
  );
}
