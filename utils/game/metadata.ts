import { z } from "zod";

import type { Json } from "../supabase/database.types";

const opponentLineupMode = z.enum(["runs-only", "minimal", "detailed"]);

export type OpponentLineupMode = z.infer<typeof opponentLineupMode>;

const opponentLineupSettings = z.object({
  mode: opponentLineupMode,
});
export type OpponentLineupSettings = z.infer<typeof opponentLineupSettings>;

const setupStep = z.enum(["enter-lineup", "enter-opponent-lineup", "enter-game-settings"]);

const setupState = z.object({
  steps: z.array(
    z.object({
      name: setupStep,
      isCompleted: z.boolean(),
    }),
  ),
});

export type SetupState = z.infer<typeof setupState>;

export const defaultSetupState: SetupState = {
  steps: [
    { name: "enter-lineup", isCompleted: false },
    { name: "enter-opponent-lineup", isCompleted: false },
    { name: "enter-game-settings", isCompleted: false },
  ],
};

const mercyRule = z
  .array(
    z.object({
      inning: z.number().min(3).max(8),
      deficit: z.number().min(0),
    }),
  )
  .refine(rules => rules.length > 0, {
    message: "At least one mercy rule is required",
  })
  .refine(rules => rules.every((rule, i) => i === 0 || rule.inning > rules[i - 1].inning), {
    message: "Innings must be in ascending order",
  });

export type MercyRule = z.infer<typeof mercyRule>;

const gameConfiguration = z.object({
  gameLengthInnings: z.number(),
  gameLengthMinutes: z.number().nullable(),
  mercyRule: mercyRule.nullable(),
  allowFlipFlop: z.boolean(),
  homeRunLimit: z.number().min(1).nullable(),
  allowDHH: z.boolean(),
  allowInningEndingDBOs: z.boolean(),
  allowTies: z.boolean(),
  require10BatterMinimum: z.boolean(),
});

export type GameConfiguration = z.infer<typeof gameConfiguration>;

export const defaultGameConfiguration: GameConfiguration = {
  gameLengthInnings: 7,
  gameLengthMinutes: 50,
  mercyRule: null,
  allowFlipFlop: false,
  homeRunLimit: 1,
  allowDHH: false,
  allowInningEndingDBOs: false,
  allowTies: false,
  require10BatterMinimum: false,
};

const gameDataSchema = z.object({
  opponentLineupSettings,
  setupState,
  gameConfiguration,
});
export type GameData = z.infer<typeof gameDataSchema>;

export const parseGameData = (gameData: Json) => {
  return gameDataSchema.parse(gameData);
};
