"use client";

import { Switch } from "@heroui/react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className }: { className?: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevents hydration mismatch
  }

  return (
    <div onClick={e => e.stopPropagation()} className={className}>
      <Switch
        size="sm"
        color="default"
        aria-label="Toggle theme"
        thumbIcon={({ isSelected, className }) =>
          isSelected ? (
            <MoonIcon className={className} weight="duotone" />
          ) : (
            <SunIcon className={className} weight="duotone" />
          )
        }
        isSelected={theme === "dark"}
        onValueChange={isSelected => setTheme(isSelected ? "dark" : "light")}
      />
    </div>
  );
}
