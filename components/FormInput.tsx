"use client";

import { Input } from "@heroui/input";
import { forwardRef } from "react";

import type { InputProps } from "@heroui/input";

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return (
      <Input
        ref={ref}
        classNames={{
          base: "relative",
          helperWrapper: "absolute bottom-0 translate-y-full",
        }}
        isInvalid={!!props.errorMessage}
        {...props}
      />
    );
  },
);
FormInput.displayName = "FormInput";
