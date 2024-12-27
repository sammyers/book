import type { FieldingPosition } from "../display";

interface LineupSpot {
  playerId: string;
  position: FieldingPosition;
}

export interface GameData {
  /** Player pool for pickup games */
  playerList?: string[];
  /**
   * Submitted lineups for the participating teams - should only be present before game has started
   *
   * Mapping from team id to list of lineup spots
   */
  lineups?: Record<string, LineupSpot[]>;
}
