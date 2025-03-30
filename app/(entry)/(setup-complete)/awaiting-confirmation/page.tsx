import { CardBody, CardHeader } from "@heroui/card";
import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

export default async function AwaitingConfirmationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/welcome");
  }

  if (!searchParams.email) {
    redirect("/login");
  }

  return (
    <>
      <CardHeader>
        <h1>You&apos;re almost done!</h1>
      </CardHeader>
      <CardBody>
        <p>We sent a confirmation email to {searchParams.email}.</p>
      </CardBody>
    </>
  );
}
