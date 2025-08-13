"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { User } from "@heroui/user";
import { map } from "lodash";
import { useActionState, useCallback, useMemo, useState } from "react";

import { Alert } from "@/components/Alert";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { getPositions } from "@/utils/display";
import { useDebouncedState } from "@/utils/hooks/useDebouncedState";
import { createClient } from "@/utils/supabase/browser";

import { createTeam } from "../actions";

import type { Player } from "@/utils/display";

export default function NewTeamPage() {
  const [teamName, setTeamName] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const fetchPlayers = useCallback(async (search: string) => {
    const supabase = createClient();

    if (!search) {
      setSearchResults([]);
      return;
    }

    setIsSearchLoading(true);

    const { data, error } = await supabase
      .from("player")
      .select(
        `
        id,
        name,
        jersey_number,
        primary_position,
        secondary_position,
        nickname`,
      )
      .ilike("name", `%${search}%`);

    setIsSearchLoading(false);

    if (!error) {
      setSearchResults(data);
    } else {
    }
  }, []);

  const [searchValue, setSearchValue] = useDebouncedState<string>(
    "",
    fetchPlayers,
  );

  const [addedPlayers, setAddedPlayers] = useState<Player[]>([]);

  const addPlayer = useCallback(
    (player: Player) => setAddedPlayers((players) => [...players, player]),
    [setAddedPlayers],
  );
  const removePlayer = useCallback(
    (playerId: string) =>
      setAddedPlayers((players) => players.filter(({ id }) => id !== playerId)),
    [setAddedPlayers],
  );

  const addedPlayerIds = useMemo(
    () => new Set(map(addedPlayers, "id")),
    [addedPlayers],
  );

  const filteredResults = useMemo(
    () => searchResults.filter(({ id }) => !addedPlayerIds.has(id)),
    [searchResults, addedPlayerIds],
  );

  const [formState, formAction] = useActionState(createTeam, null);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center">Create Your Team</h2>
      <Input
        size="lg"
        label="Team Name"
        className="self-center"
        fullWidth={false}
        value={teamName}
        onValueChange={setTeamName}
      />
      <h2 className="text-center">Add Players</h2>
      <div className="flex gap-4 flex-col sm:flex-row">
        <Table
          className="flex-1"
          topContent={
            <Input
              placeholder="Search by name..."
              value={searchValue}
              onValueChange={setSearchValue}
              startContent={<MagnifyingGlassIcon className="size-4" />}
              isClearable
            />
          }
        >
          <TableHeader>
            <TableColumn>RESULTS</TableColumn>
            <TableColumn align="end">{""}</TableColumn>
          </TableHeader>
          <TableBody
            loadingState={isSearchLoading ? "loading" : "idle"}
            loadingContent={<Spinner color="default" />}
            emptyContent="No players found"
            items={filteredResults}
          >
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <User name={item.name} description={getPositions(item)} />
                </TableCell>
                <TableCell>
                  <Button onPress={() => addPlayer(item)}>Add</Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Table className="flex-1">
          <TableHeader>
            <TableColumn>ROSTER</TableColumn>
            <TableColumn align="end">{""}</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No players added" items={addedPlayers}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <User name={item.name} description={getPositions(item)} />
                </TableCell>
                <TableCell>
                  <Button color="danger" onPress={() => removePlayer(item.id)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {formState?.status === "error" && <Alert>{formState.message}</Alert>}
      <FormSubmitButton
        color="success"
        isValid={teamName.length > 0 && addedPlayerIds.size > 0}
        onPress={() =>
          formAction({ name: teamName, playerIds: Array.from(addedPlayerIds) })
        }
      >
        Create Team
      </FormSubmitButton>
    </div>
  );
}
