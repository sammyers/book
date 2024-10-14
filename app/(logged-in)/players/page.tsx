import { createClient } from "@/utils/supabase/server";

import RealtimePlayers from "./RealtimePlayers";

export default async function Players() {
  const supabase = createClient();
  const { data } = await supabase.from("player").select();

  return <RealtimePlayers initialPlayers={data ?? []} />;
}
