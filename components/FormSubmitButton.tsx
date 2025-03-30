"use client";

import { Button } from "@heroui/button";
import { forwardRef } from "react";
import { useFormStatus } from "react-dom";

import type { ButtonProps } from "@heroui/button";

export const FormSubmitButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { isValid: boolean }
>(({ isValid, ...props }, ref) => {
  const { pending } = useFormStatus();

  return (
    <Button
      ref={ref}
      type="submit"
      color="primary"
      isDisabled={!isValid}
      isLoading={pending}
      {...props}
    />
  );
});
FormSubmitButton.displayName = "FormSubmitButton";
