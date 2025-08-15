"use client";

import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

import { createPlayerForTeam } from "../../../actions";
import NewPlayerForm from "./NewPlayerForm";
import PlayerSearch from "./PlayerSearch";

import type { FieldingPosition } from "@/utils/display";

export default function AddToRosterPage() {
  const { teamId } = useParams<{ teamId: string }>();

  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false);
  const [defaultNameValue, setDefaultNameValue] = useState("");

  const [recentlyAddedPlayerIds, setRecentlyAddedPlayerIds] = useState<
    string[]
  >([]);

  const handlePlayerAdded = useCallback((playerId: string) => {
    setRecentlyAddedPlayerIds((prev) => [...prev, playerId]);
  }, []);

  const handleCreateNewPlayer = useCallback((searchValue: string) => {
    setShowNewPlayerForm(true);
    setDefaultNameValue(searchValue);
  }, []);

  const handleCancelNewPlayer = useCallback(() => {
    setShowNewPlayerForm(false);
    setDefaultNameValue("");
  }, []);

  const handleCreatePlayerSubmit = useCallback(
    (formData: FormData) => {
      const name = formData.get("name") as string;
      const primaryPosition = formData.get(
        "primaryPosition",
      ) as FieldingPosition;
      const secondaryPosition =
        (formData.get("secondaryPosition") as FieldingPosition) || undefined;
      const jerseyNumber =
        (formData.get("jerseyNumber") as string) || undefined;
      const nickname = (formData.get("nickname") as string) || undefined;

      return createPlayerForTeam(null, {
        name,
        primaryPosition,
        secondaryPosition,
        jerseyNumber,
        nickname,
        teamId,
      });
    },
    [teamId],
  );

  if (showNewPlayerForm) {
    return (
      <NewPlayerForm
        teamId={teamId}
        defaultNameValue={defaultNameValue}
        onCancel={handleCancelNewPlayer}
      />
    );
  }

  return (
    <PlayerSearch
      teamId={teamId}
      recentlyAddedPlayerIds={recentlyAddedPlayerIds}
      onPlayerAdded={handlePlayerAdded}
      onCreateNewPlayer={handleCreateNewPlayer}
    />
  );
}
