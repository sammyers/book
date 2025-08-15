import { CardBody, CardHeader } from "@heroui/card";
import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

import type { PageProps } from "@/utils/types";

export default async function AwaitingConfirmationPage({
  searchParams,
}: PageProps<never, { email: string }>) {
  const { email } = await searchParams;

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/welcome");
  }

  if (!email) {
    redirect("/login");
  }

  return (
    <>
      <CardHeader>
        <h1>You&apos;re almost done!</h1>
      </CardHeader>
      <CardBody>
        <p>We sent a confirmation email to {email}.</p>
      </CardBody>
    </>
  );
}
