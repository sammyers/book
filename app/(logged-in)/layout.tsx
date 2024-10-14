import type { ReactNode } from "react";

export default async function LoggedInLayout({
  children,
  navbar,
}: {
  children: ReactNode;
  navbar: ReactNode;
}) {
  return (
    <div className="h-full flex flex-col overflow-auto">
      {navbar}
      <main className="flex-grow flex flex-col px-4 pt-4 pb-8 bg-background">
        {children}
      </main>
    </div>
  );
}
