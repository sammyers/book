"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import { loginFormSchema } from "./(setup-incomplete)/login/formSchema";
import { registerFormSchema } from "./(setup-incomplete)/register/formSchema";

import type { FormState } from "@/utils/types";
import type { LoginFormSchema } from "./(setup-incomplete)/login/formSchema";

export async function registerUser(
  _prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerFormSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid form data",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: `Server validation: ${issue.message}`,
      })),
    };
  }

  const { email, password, firstName, lastName } = parsed.data;

  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { firstName, lastName } },
  });

  if (!error) {
    revalidatePath("/", "layout");

    const queryParams = new URLSearchParams();
    queryParams.set("email", user!.email!);
    redirect(`/awaiting-confirmation?${queryParams.toString()}`);
  }

  return {
    status: "error",
    message: error.message,
    errors: [],
  };
}

export async function login(
  _prevState: FormState | null,
  formData: LoginFormSchema,
): Promise<FormState> {
  const parsed = loginFormSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid form data",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: `Server validation: ${issue.message}`,
      })),
    };
  }

  const { email, password } = parsed.data;

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (!error) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  return {
    status: "error",
    message: error.message,
    errors: [],
  };
}
