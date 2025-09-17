"use client";

import { Button } from "@heroui/button";
import { cn } from "@heroui/react";
import { MoonIcon, QuestionIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import type { ButtonProps } from "@heroui/button";

export function ThemeToggleButton({ className, ...props }: ButtonProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Button
        isIconOnly
        variant="bordered"
        radius="full"
        className={cn("text-default-500 border-1", className)}
        {...props}
      >
        <QuestionIcon size={24} weight="duotone" />
      </Button>
    );
  }

  const Icon = theme === "dark" ? MoonIcon : SunIcon;

  return (
    <Button
      isIconOnly
      variant="bordered"
      radius="full"
      className={cn("text-default-500 border-1", className)}
      onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
      {...props}
    >
      <Icon size={24} weight="duotone" />
    </Button>
  );
}
