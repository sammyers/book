import { z } from "zod";

export const newGameFormSchema = z.object({
  awayTeamId: z.string().uuid(),
  homeTeamId: z.string().uuid(),
  name: z.string().min(1, { message: "Required" }),
});

export type NewGameFormSchema = z.infer<typeof newGameFormSchema>;
