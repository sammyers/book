import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import {
  ArrowLeftIcon,
  EmptyIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { useDebouncedState } from "@/utils/hooks/useDebouncedState";
import { createClient } from "@/utils/supabase/browser";

import { getPlayerSearchQuery } from "../../../queries";
import PlayerSearchItem from "./PlayerSearchResult";

import type { PlayerSearchResult } from "../../../queries";

interface PlayerSearchProps {
  teamId: string;
  recentlyAddedPlayerIds: string[];
  onPlayerAdded: (playerId: string) => void;
  onCreateNewPlayer: (searchValue: string) => void;
}

export default function PlayerSearch({
  teamId,
  recentlyAddedPlayerIds,
  onPlayerAdded,
  onCreateNewPlayer,
}: PlayerSearchProps) {
  const [searchResults, setSearchResults] = useState<PlayerSearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const fetchPlayers = useCallback(async (search: string) => {
    const supabase = createClient();

    if (!search) {
      setSearchResults([]);
      return;
    }

    setIsSearchLoading(true);

    const { data, error } = await getPlayerSearchQuery(supabase, search).limit(
      3,
    );

    setIsSearchLoading(false);

    if (!error && data) {
      setSearchResults(data);
    }
  }, []);

  const [
    searchValue,
    setSearchValue,
    { debouncedValue: debouncedSearchValue },
  ] = useDebouncedState<string>("", fetchPlayers);

  const content = useMemo(() => {
    const spinner = (
      <Spinner
        size="lg"
        color="default"
        label="Searching for players..."
        classNames={{
          label: "text-default-400 text-medium",
          wrapper: "w-12 h-12",
          base: "gap-2",
        }}
      />
    );

    const createNewPlayerButton = (
      <Button
        color="primary"
        variant="flat"
        onPress={() => onCreateNewPlayer(debouncedSearchValue)}
        startContent={<PlusIcon size={16} />}
      >
        Create New Player
        {searchValue.length > 0 && debouncedSearchValue.length >= 3
          ? ` "${debouncedSearchValue}"`
          : ""}
      </Button>
    );

    if (searchValue.length === 0 || debouncedSearchValue.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 py-6">
          <MagnifyingGlassIcon
            size={48}
            weight="duotone"
            className="text-default-400"
          />
          <p className="text-default-400">
            Start typing to search for a player
          </p>
          <p className="text-default-400 text-xs">or</p>
          {createNewPlayerButton}
        </div>
      );
    }

    if (!searchResults.length && isSearchLoading) {
      return (
        <div className="flex flex-col items-center gap-2 py-6">{spinner}</div>
      );
    }

    if (!searchResults.length) {
      return (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex flex-col items-center gap-2">
            <EmptyIcon
              size={48}
              weight="duotone"
              className="text-default-400"
            />
            <p className="text-default-400 text-center">
              No players found matching &quot;{debouncedSearchValue}&quot;
            </p>
          </div>
          {debouncedSearchValue.length >= 3 && createNewPlayerButton}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 relative">
        <div className="flex flex-col gap-2">
          {searchResults.map((player) => (
            <PlayerSearchItem
              key={player.id}
              player={player}
              currentTeamId={teamId}
              wasJustAdded={recentlyAddedPlayerIds.includes(player.id)}
              onPlayerAdded={() => onPlayerAdded(player.id)}
            />
          ))}
        </div>
        {debouncedSearchValue.length >= 3 && createNewPlayerButton}
        {isSearchLoading && (
          <div className="absolute inset-0 bg-content1/50 z-10 flex items-center justify-center">
            {spinner}
          </div>
        )}
      </div>
    );
  }, [
    searchValue,
    debouncedSearchValue,
    onCreateNewPlayer,
    searchResults,
    isSearchLoading,
    recentlyAddedPlayerIds,
    teamId,
    onPlayerAdded,
  ]);

  return (
    <Card className="shadow-small">
      <CardHeader className="p-4 pb-0">
        <div className="w-full flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Players</h3>
          <Button
            color="danger"
            variant="flat"
            as={Link}
            href={`/team/${teamId}/roster`}
            startContent={<ArrowLeftIcon size={16} weight="duotone" />}
          >
            Back to Roster
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-4 gap-4">
        <Input
          className="flex-1"
          placeholder="Type a player name to search..."
          value={searchValue}
          onValueChange={(value) => {
            setSearchValue(value);
            if (value.length === 0) {
              setSearchResults([]);
            }
          }}
          startContent={<MagnifyingGlassIcon size={16} />}
          isClearable
        />
        {content}
      </CardBody>
    </Card>
  );
}
