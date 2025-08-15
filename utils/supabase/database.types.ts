import { Constants as GeneratedConstants } from "./database-generated.types";

import type { MergeDeep } from "type-fest";
import type {
  CompositeTypes,
  Database as DatabaseGenerated,
} from "./database-generated.types";

export const fieldingPositions =
  GeneratedConstants.public.Enums.fielding_position;

export type {
  Json,
  Tables,
  Enums,
  CompositeTypes,
} from "./database-generated.types";

type NewGameTeam = {
  [P in keyof CompositeTypes<"new_game_team">]: NonNullable<
    CompositeTypes<"new_game_team">[P]
  >;
};

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      CompositeTypes: {
        new_game_team: NewGameTeam;
      };
      Functions: {
        create_game: {
          Args: {
            teams: NewGameTeam[];
          };
        };
      };
    };
  }
>;
