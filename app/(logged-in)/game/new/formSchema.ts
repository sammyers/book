import { z } from "zod";

export const newGameFormSchema = z.object({
  teamId: z.string().uuid(),
  opponentTeamId: z.string().uuid(),
  role: z.enum(["home", "away"]),
  name: z.string().min(1, { message: "Required" }),
});

export type NewGameFormSchema = z.infer<typeof newGameFormSchema>;
