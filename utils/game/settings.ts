import { z } from "zod";

import type { Json } from "../supabase/database.types";

const gameSettingsSchema = z.object({
  trackOpponentAtBats: z.boolean(),
});
export type GameSettings = z.infer<typeof gameSettingsSchema>;

export const getGameSettings = (gameData: Json) => {
  return gameSettingsSchema.parse(gameData);
};
