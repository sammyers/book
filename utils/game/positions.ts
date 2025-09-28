import { fieldingPositions } from "../supabase/database.types";

import type { FieldingPosition, Player } from "../supabase/database.types";
import type { FieldingConfiguration, Lineup } from "./lineups";

export function getPossiblePositions({ numInfielders, numOutfielders }: FieldingConfiguration) {
  return fieldingPositions.filter(position => {
    switch (position) {
      case "middle_infield":
        return numInfielders === 5;
      case "left_center_field":
        return numOutfielders === 4;
      case "right_center_field":
        return numOutfielders === 4;
      case "center_field":
        return numOutfielders === 3;
      default:
        return true;
    }
  });
}

export function getInitialPositionForPlayer(
  player: Player<"primary_position" | "secondary_position">,
  lineup: Lineup,
  positionToSwap?: FieldingPosition,
) {
  const possiblePositions = new Set(getPossiblePositions(lineup.fieldingConfiguration));
  const occupiedPositions = new Set(lineup.players.map(p => p.position));
  if (
    !occupiedPositions.has(player.primary_position) &&
    possiblePositions.has(player.primary_position) &&
    player.primary_position !== "extra_hitter"
  ) {
    return player.primary_position;
  }
  if (
    player.secondary_position &&
    !occupiedPositions.has(player.secondary_position) &&
    possiblePositions.has(player.secondary_position) &&
    player.secondary_position !== "extra_hitter"
  ) {
    return player.secondary_position;
  }

  if (positionToSwap) {
    return positionToSwap;
  }

  const nextPosition = [...possiblePositions].find(p => !occupiedPositions.has(p));
  if (nextPosition) {
    return nextPosition;
  }
  return "extra_hitter";
}
