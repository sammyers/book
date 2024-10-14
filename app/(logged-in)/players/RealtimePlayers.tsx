"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/browser";

import type { Tables } from "@/utils/supabase/database.types";

type Player = Tables<"player">;

export default function RealtimePlayers({
  initialPlayers,
}: {
  initialPlayers: Player[];
}) {
  const [players, setPlayers] = useState(initialPlayers);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("realtime users")
      .on<Player>(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "player" },
        ({ new: newPlayer }) => {
          setPlayers((players) => [...players, newPlayer]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <pre>{JSON.stringify(players, null, 2)}</pre>;
}
