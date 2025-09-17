import { z } from "zod";

import { fieldingPositions } from "../supabase/database.types";
import { getInitialPositionForPlayer } from "./positions";

import type { Json, Player } from "../supabase/database.types";

const lineupEntrySchema = z.object({
  playerId: z.string(),
  battingOrder: z.number(),
  position: z.enum(fieldingPositions),
});
export type LineupEntry = z.infer<typeof lineupEntrySchema>;

const lineupSchema = z.object({
  players: z.array(lineupEntrySchema),
  fieldingConfiguration: z.object({
    numInfielders: z.number(),
    numOutfielders: z.number(),
  }),
});
export type Lineup = z.infer<typeof lineupSchema>;
export type FieldingConfiguration = Lineup["fieldingConfiguration"];

export const getLineup = (lineupData: Json) => {
  return lineupSchema.parse(lineupData);
};

export const DEFAULT_FIELDING_CONFIGURATION: FieldingConfiguration = {
  numInfielders: 4,
  numOutfielders: 4,
};

export function buildInitialLineup(
  players: Player<"id" | "primary_position" | "secondary_position">[],
  fieldingConfiguration: FieldingConfiguration = DEFAULT_FIELDING_CONFIGURATION,
): Lineup {
  const lineup: Lineup = {
    fieldingConfiguration,
    players: [],
  };
  players.forEach(player => {
    lineup.players.push({
      playerId: player.id,
      battingOrder: lineup.players.length + 1,
      position: getInitialPositionForPlayer(player, lineup),
    });
  });
  return lineup;
}
