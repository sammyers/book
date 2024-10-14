import { CardBody, CardHeader } from "@nextui-org/card";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export default async function AwaitingConfirmationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();

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
