import { z } from "zod";

import { fieldingPositions } from "@/utils/supabase/database.types";

export const createPlayerFormSchema = z.object({
  teamId: z.string().uuid("Invalid team ID"),
  name: z.string().min(1, { message: "Required" }),
  primaryPosition: z.enum(fieldingPositions),
  secondaryPosition: z.enum(fieldingPositions).optional(),
  jerseyNumber: z.string().optional(),
  nickname: z.string().optional(),
});

export type CreatePlayerFormSchema = z.infer<typeof createPlayerFormSchema>;
