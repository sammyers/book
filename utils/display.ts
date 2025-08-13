import type { Enums, Tables } from "./supabase/database.types";

export type FieldingPosition = Enums<"fielding_position">;

export const getPositionAbbreviation = (position: FieldingPosition) => {
  switch (position) {
    case "pitcher":
      return "P";
    case "catcher":
      return "C";
    case "first_base":
      return "1B";
    case "second_base":
      return "2B";
    case "third_base":
      return "3B";
    case "shortstop":
      return "SS";
    case "left_field":
      return "LF";
    case "center_field":
      return "CF";
    case "right_field":
      return "RF";
    case "left_center_field":
      return "LCF";
    case "right_center_field":
      return "RCF";
    case "middle_infield":
      return "MI";
    case "extra_hitter":
      return "EH";
  }
};

export type Player = Omit<Tables<"player">, "created_at">;

export function getPositions(player: Player) {
  if (!player.secondary_position) {
    return getPositionAbbreviation(player.primary_position);
  }
  return `${getPositionAbbreviation(player.primary_position)}/${getPositionAbbreviation(player.secondary_position)}`;
}

export const getOpponentPrefix = (role: Enums<"team_role">) => {
  switch (role) {
    case "home":
      return "vs.";
    case "away":
      return "@";
  }
};
