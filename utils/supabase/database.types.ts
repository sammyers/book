import { Constants as GeneratedConstants } from "./database-generated.types";

import type { MergeDeep, Simplify } from "type-fest";
import type {
  CompositeTypes,
  Database as DatabaseGenerated,
  Enums,
  Tables,
} from "./database-generated.types";

export type { Json, CompositeTypes } from "./database-generated.types";
export type { Enums, Tables };

export const fieldingPositions = GeneratedConstants.public.Enums.fielding_position;

export type TeamRole = Enums<"team_role">;
export type FieldingPosition = Enums<"fielding_position">;

export type Player<Keys extends keyof Tables<"player"> = keyof Tables<"player">> = Simplify<
  Pick<Tables<"player">, Keys>
>;

type NewGameTeam = {
  [P in keyof CompositeTypes<"new_game_team">]: NonNullable<CompositeTypes<"new_game_team">[P]>;
};

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      CompositeTypes: {
        new_game_team: NewGameTeam;
      };
    };
  }
>;
