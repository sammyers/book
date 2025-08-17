"use client";

import { forwardRef, useState } from "react";

import { FormInput } from "./FormInput";
import { EyeFilledIcon } from "./icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "./icons/EyeSlashFilledIcon";

import type { InputProps } from "@heroui/input";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormInput
      ref={ref}
      isInvalid={!!props.errorMessage}
      endContent={
        <button
          className="focus:outline-hidden"
          type="button"
          onClick={() => setIsVisible(state => !state)}
        >
          {isVisible ? (
            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
          ) : (
            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
          )}
        </button>
      }
      type={isVisible ? "text" : "password"}
      {...props}
    />
  );
});
PasswordInput.displayName = "PasswordInput";
