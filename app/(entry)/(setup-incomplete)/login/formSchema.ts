import { z } from "zod";
import { zfd } from "zod-form-data";

export const loginFormSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  password: z.string().min(1, { message: "Required" }),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
