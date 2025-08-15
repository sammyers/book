"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlashMessage } from "@/utils/flash";
import { createServerClient } from "@/utils/supabase/server";
import { getCurrentUserPermissionLevel } from "@/utils/supabase/users";

import type { FormState } from "@/utils/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InviteUserSchema, NewTeamSchema } from "./forms";

export async function checkUserByEmail(email: string) {
  const supabase = await createServerClient();

  const { data: user, error } = await supabase
    .from("user")
    .select("id, first_name, last_name, email")
    .eq("email", email)
    .single();

  if (error) {
    return null;
  }

  return user;
}

async function inviteUserByEmail(
  supabase: SupabaseClient,
  {
    email,
    firstName,
    lastName,
  }: { email: string; firstName: string; lastName: string },
) {
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NEXT_PUBLIC_APP_URL;

  return await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      firstName,
      lastName,
    },
    redirectTo: `${baseUrl}/accept-invite`,
  });
}

export async function createTeamWithManager(
  _prevState: FormState | null,
  formData: NewTeamSchema,
): Promise<FormState> {
  const supabase = await createServerClient();
  const permissionLevel = await getCurrentUserPermissionLevel(supabase);

  if (permissionLevel !== "super_admin") {
    return {
      status: "error",
      message: "You are not authorized to create a team",
      errors: [],
    };
  }

  let managerId: string;

  if (formData.manager.type === "new_user") {
    const adminClient = await createServerClient({ admin: true });

    const { data: userResponse, error: userError } = await inviteUserByEmail(
      adminClient,
      formData.manager,
    );

    if (userError) {
      return {
        status: "error",
        message: userError.message,
        errors: [],
      };
    }
    managerId = userResponse.user.id;
  } else {
    managerId = formData.manager.userId;
  }

  // Create the team
  const { data: newTeam, error: teamError } = await supabase
    .from("team")
    .insert({
      name: formData.name,
      location_city: formData.city,
      location_state: formData.state,
      admin_note: formData.description,
    })
    .select()
    .single();

  if (teamError) {
    return {
      status: "error",
      message: teamError.message,
      errors: [],
    };
  }

  const { error: membershipError } = await supabase.from("user_team").insert({
    user_id: managerId,
    team_id: newTeam.id,
    permission_level: "manager",
  });

  if (membershipError) {
    return {
      status: "error",
      message: membershipError.message,
      errors: [],
    };
  }

  await setFlashMessage({
    title: `Team created`,
    description: `New team ${newTeam.name} created`,
    color: "success",
  });

  revalidatePath("/admin/teams");
  redirect(`/admin/teams`);
}

export async function inviteUser(
  _prevState: FormState | null,
  formData: InviteUserSchema,
): Promise<FormState> {
  const supabase = await createServerClient();
  const permissionLevel = await getCurrentUserPermissionLevel(supabase);

  if (permissionLevel !== "super_admin") {
    return {
      status: "error",
      message: "You are not authorized to invite a user",
      errors: [],
    };
  }

  const adminClient = await createServerClient({ admin: true });

  const { data: userResponse, error: userError } = await inviteUserByEmail(
    adminClient,
    formData,
  );

  if (userError) {
    return {
      status: "error",
      message: userError.message,
      errors: [],
    };
  }

  // Add user to the selected team with the specified permission level
  const { error: membershipError } = await supabase.from("user_team").insert({
    user_id: userResponse.user.id,
    team_id: formData.teamId,
    permission_level: formData.permissionLevel,
  });

  if (membershipError) {
    return {
      status: "error",
      message: membershipError.message,
      errors: [],
    };
  }

  revalidatePath("/admin/users");
  redirect(`/admin/users`);
}
