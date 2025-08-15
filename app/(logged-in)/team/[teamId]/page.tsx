import { redirect } from "next/navigation";

import { PageProps } from "@/utils/types";

export default async function TeamPage({
  params,
}: PageProps<{ teamId: string }>) {
  const { teamId } = await params;

  redirect(`/team/${teamId}/games`);
}
