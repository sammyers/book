"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";

import type { RouterOptions } from "@react-types/shared";

type Navigate = (path: string, routerOptions: RouterOptions | undefined) => void;

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push as Navigate} className="h-full flex flex-col">
      <ToastProvider placement="top-center" />
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </HeroUIProvider>
  );
}
