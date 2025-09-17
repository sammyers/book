import type { Player, Tables } from "@/utils/supabase/database.types";

interface Props extends Pick<Tables<"player_team">, "jersey_number"> {
  player: Player<"name" | "nickname">;
}

export function PlayerNameplate({ player, jersey_number }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">{player.nickname ? player.nickname : player.name}</p>
        {jersey_number && <p className="text-xs text-gray-500 pt-px">#{jersey_number}</p>}
      </div>
      {player.nickname && <span className="text-xs text-gray-500">{player.name}</span>}
    </div>
  );
}
