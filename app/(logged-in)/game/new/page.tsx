import { createClient } from "@/utils/supabase/server";

import NewGameForm from "./NewGameForm";

export default async function NewGamePage() {
  const supabase = createClient();

  const { data: teams, error } = await supabase.from("team").select();

  if (error) {
    return <div></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <NewGameForm teams={teams} />
    </div>
  );
}
