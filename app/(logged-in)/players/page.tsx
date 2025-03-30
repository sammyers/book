import { createServerClient } from "@/utils/supabase/server";

import RealtimePlayers from "./RealtimePlayers";

export default async function Players() {
  const supabase = await createServerClient();
  const { data } = await supabase.from("player").select();

  return <RealtimePlayers initialPlayers={data ?? []} />;
}
