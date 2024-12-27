"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
} from "@nextui-org/react";
import { map } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { useFormState } from "react-dom";

import { Alert } from "@/components/Alert";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { getPositions, Player } from "@/utils/display";
import { useDebouncedState } from "@/utils/hooks/useDebouncedState";
import { createClient } from "@/utils/supabase/browser";

import { createTeam } from "../actions";

export default function NewTeamPage() {
  const [teamName, setTeamName] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);

  const fetchPlayers = useCallback(async (search: string) => {
    const supabase = createClient();

    if (!search) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("player")
      .select(
        `
    id,
    name,
    primary_position,
    secondary_position`,
      )
      .ilike("name", `%${search}%`);

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

  const [formState, formAction] = useFormState(createTeam, null);

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
              label="Search Players"
              value={searchValue}
              onValueChange={setSearchValue}
              startContent={<MagnifyingGlassIcon className="size-4" />}
            />
          }
        >
          <TableHeader>
            <TableColumn>RESULTS</TableColumn>
            <TableColumn align="end">{""}</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No players found" items={filteredResults}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <User name={item.name} description={getPositions(item)} />
                </TableCell>
                <TableCell>
                  <Button onClick={() => addPlayer(item)}>Add</Button>
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
                  <Button color="danger" onClick={() => removePlayer(item.id)}>
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
        onClick={() =>
          formAction({ name: teamName, playerIds: Array.from(addedPlayerIds) })
        }
      >
        Create Team
      </FormSubmitButton>
    </div>
  );
}
