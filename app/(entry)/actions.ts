"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerClient } from "@/utils/supabase/server";

import { loginFormSchema, registerFormSchema, setPasswordFormSchema } from "./forms";

import type { FormState } from "@/utils/types";
import type { LoginFormSchema, RegisterFormSchema, SetPasswordFormSchema } from "./forms";

export async function registerUser(
  _prevState: FormState | null,
  formData: RegisterFormSchema,
): Promise<FormState> {
  const parsed = registerFormSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid form data",
      errors: parsed.error.issues.map(issue => ({
        path: issue.path.join("."),
        message: `Server validation: ${issue.message}`,
      })),
    };
  }

  const { email, password, firstName, lastName } = parsed.data;

  const supabase = await createServerClient();

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
      errors: parsed.error.issues.map(issue => ({
        path: issue.path.join("."),
        message: `Server validation: ${issue.message}`,
      })),
    };
  }

  const { email, password } = parsed.data;

  const supabase = await createServerClient();

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

export async function setPassword(
  _prevState: FormState | null,
  formData: SetPasswordFormSchema,
): Promise<FormState> {
  const parsed = setPasswordFormSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid form data",
      errors: parsed.error.issues.map(issue => ({
        path: issue.path.join("."),
        message: `Server validation: ${issue.message}`,
      })),
    };
  }

  const { password } = parsed.data;

  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
      errors: [],
    };
  }

  const { error: userError } = await supabase
    .from("user")
    .update({
      has_set_password: true,
    })
    .eq("id", user!.id);

  if (userError) {
    return {
      status: "error",
      message: userError.message,
      errors: [],
    };
  }

  revalidatePath("/", "layout");
  redirect("/welcome");
}

export async function setSessionForInvitedUser(accessToken: string, refreshToken: string) {
  const supabase = await createServerClient();

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw new Error(error.message);
  } else {
    redirect("/set-password");
  }
}
