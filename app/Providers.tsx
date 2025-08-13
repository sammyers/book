"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push} className="h-screen flex flex-col">
      <ToastProvider placement="top-center" />
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </HeroUIProvider>
  );
}
