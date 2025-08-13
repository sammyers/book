import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  password: z.string().min(1, { message: "Required" }),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  firstName: z.string().min(1, { message: "Required" }),
  lastName: z.string().min(1, { message: "Required" }),
  email: z.string().email("Must be a valid email address"),
  password: z.string().min(8, { message: "Must be at least 8 characters" }),
});

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;

export const setPasswordFormSchema = z.object({
  password: z.string().min(8, { message: "Must be at least 8 characters" }),
});

export type SetPasswordFormSchema = z.infer<typeof setPasswordFormSchema>;
