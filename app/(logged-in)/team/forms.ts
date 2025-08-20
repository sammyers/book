import { CalendarDate, ZonedDateTime } from "@internationalized/date";
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

export const newGameFormSchema = z.object({
  teamId: z.string().uuid(),
  opponentTeamId: z.string().uuid(),
  role: z.enum(["home", "away"]),
  name: z.string().min(1, { message: "Required" }),
  tournamentId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  scheduledStartTime: z.instanceof(ZonedDateTime),
});

export type NewGameFormSchema = z.infer<typeof newGameFormSchema>;

export const newTournamentFormSchema = z.object({
  teamId: z.string().uuid(),
  name: z.string().min(1, { message: "Required" }),
  association: z.string().min(1, { message: "Required" }),
  regionId: z.string().uuid(),
  location: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("single_location"),
      locationId: z.string().uuid(),
    }),
    z.object({
      type: z.literal("multiple_locations"),
      city: z.string().min(1, { message: "Required" }),
      state: z.string().optional(),
    }),
  ]),
  dateRange: z.object({
    start: z.instanceof(CalendarDate),
    end: z.instanceof(CalendarDate),
  }),
});

export type NewTournamentFormSchema = z.infer<typeof newTournamentFormSchema>;
export type NewTournamentActionData = Omit<NewTournamentFormSchema, "dateRange"> & {
  dateRange: {
    start: string;
    end: string;
  };
  redirectToNewGame?: boolean;
};

export const makeNewTournamentActionData = (
  formData: NewTournamentFormSchema,
  redirectToNewGame?: boolean,
): NewTournamentActionData => {
  return {
    ...formData,
    dateRange: {
      start: formData.dateRange.start.toString(),
      end: formData.dateRange.end.toString(),
    },
    redirectToNewGame,
  };
};

export const newLocationFormSchema = z.object({
  name: z.string().min(1, { message: "Required" }),
  city: z.string().min(1, { message: "Required" }),
  state: z.string().optional(),
  address: z.string().optional(),
});

export type NewLocationFormSchema = z.infer<typeof newLocationFormSchema>;
