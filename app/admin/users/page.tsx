import { Alert } from "@heroui/alert";

import { createServerClient } from "@/utils/supabase/server";

import { getTeamsQuery, getUsersQuery } from "../queries";
import UsersList from "./UsersList";

export default async function AdminUsersPage() {
  const supabase = await createServerClient();

  const { data: teams } = await getTeamsQuery(supabase);
  const { data: users } = await getUsersQuery(supabase);

  if (!users || !teams) {
    return <Alert color="danger">Error loading users data</Alert>;
  }

  return <UsersList initialUsers={users} teams={teams} />;
}
