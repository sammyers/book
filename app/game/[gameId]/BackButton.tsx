"use client";

import { Button } from "@heroui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function BackButton() {
  const params = useSearchParams();
  const teamId = params.get("teamId");

  return (
    <Button
      color="primary"
      variant="flat"
      className="absolute top-2 left-2"
      isIconOnly
      radius="full"
      as={Link}
      href={teamId ? `/team/${teamId}/games` : "/"}
    >
      <ArrowLeftIcon size={24} weight="duotone" />
    </Button>
  );
}
