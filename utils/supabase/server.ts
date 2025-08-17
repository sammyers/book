import { createServerClient as supabaseCreateServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./database.types";

export async function createServerClient({
  admin = false,
}: {
  admin?: boolean;
} = {}) {
  const cookieStore = await cookies();
  return supabaseCreateServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    admin ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Don't want to error if called in a server component
          }
        },
      },
    },
  );
}
