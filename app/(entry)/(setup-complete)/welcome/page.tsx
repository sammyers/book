import { CardBody, CardHeader } from "@nextui-org/card";
import { Button, Link } from "@nextui-org/react";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export default async function WelcomePage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <>
      <CardHeader>
        <p>Welcome {data.user.email}!</p>
      </CardHeader>
      <CardBody>
        <Button as={Link} href="/" color="primary">
          Get Started
        </Button>
      </CardBody>
    </>
  );
}
