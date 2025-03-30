import { Button } from "@heroui/button";
import { CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

export default async function WelcomePage() {
  const supabase = await createServerClient();

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
