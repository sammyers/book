import { z } from "zod";

export const newTeamSchema = z.object({
  name: z.string().min(1, { message: "Required" }),
  description: z.string().optional(),
  city: z.string().min(1, { message: "Required" }),
  state: z.string().optional(),
  manager: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("existing_user"),
      email: z.string().email("Must be a valid email address"),
      userId: z.string().uuid(),
    }),
    z.object({
      type: z.literal("new_user"),
      email: z.string().email("Must be a valid email address"),
      firstName: z.string().min(1, { message: "Required" }),
      lastName: z.string().min(1, { message: "Required" }),
    }),
  ]),
});

export type NewTeamSchema = z.infer<typeof newTeamSchema>;

export const inviteUserSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  firstName: z.string().min(1, { message: "Required" }),
  lastName: z.string().min(1, { message: "Required" }),
  teamId: z.string().uuid("Must select a team"),
  permissionLevel: z.enum(["member", "scorekeeper", "manager"], {
    required_error: "Must select a permission level",
  }),
});

export type InviteUserSchema = z.infer<typeof inviteUserSchema>;
