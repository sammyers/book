import { Input } from "@nextui-org/input";
import { forwardRef } from "react";

import type { InputProps } from "@nextui-org/input";

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
