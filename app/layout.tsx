import { colors } from "@heroui/theme";
import { Inter } from "next/font/google";

import { Providers } from "./Providers";

import type { Metadata, Viewport } from "next";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Book",
  description: "A softball scorekeeping app",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    {
      media: "(prefers-color-scheme: dark)",
      color: colors.dark.background as string,
    },
    {
      media: "(prefers-color-scheme: light)",
      color: colors.light.background as string,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
