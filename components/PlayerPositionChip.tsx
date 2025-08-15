import { Chip } from "@heroui/chip";

import { getPositions } from "@/utils/display";

import type { Tables } from "@/utils/supabase/database.types";

export function PlayerPositionChip(
  props: Pick<Tables<"player">, "primary_position" | "secondary_position">,
) {
  return (
    <Chip variant="faded" radius="sm" size="sm" className="text-default-500">
      <span>{getPositions(props)}</span>
    </Chip>
  );
}
