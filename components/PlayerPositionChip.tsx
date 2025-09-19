import { Chip } from "@heroui/chip";

import { getPositions } from "@/utils/display";

import type { Tables } from "@/utils/supabase/database.types";

export function PlayerPositionChip(
  props: Pick<Tables<"player">, "primary_position" | "secondary_position">,
) {
  return (
    <Chip variant="dot" color="secondary" radius="sm" size="sm">
      <span>{getPositions(props)}</span>
    </Chip>
  );
}
