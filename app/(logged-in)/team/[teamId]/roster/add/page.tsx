"use client";

import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

import NewPlayerForm from "./NewPlayerForm";
import PlayerSearch from "./PlayerSearch";

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
