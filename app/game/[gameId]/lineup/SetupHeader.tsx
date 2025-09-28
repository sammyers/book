import { Alert } from "@heroui/alert";
import { cn } from "@heroui/react";

import { getPositionAbbreviation } from "@/utils/display";

import { useLineupValidity } from "./context";

import type { FieldingPosition } from "@/utils/display";

function getMissingPositionsMessage(missingPositions: FieldingPosition[]) {
  return `Lineup is missing the following positions: ${missingPositions.map(getPositionAbbreviation).join(", ")}`;
}

// Can render as invisible to take up the appropriate amount of space
export function SetupHeader({ isVisible = true }: { isVisible?: boolean }) {
  const { isValid, missingPositions } = useLineupValidity();
  return (
    <div
      className={cn(
        "flex flex-col pb-2",
        isVisible ? "visible z-20 absolute top-14 left-3 right-3" : "invisible",
      )}
    >
      {isValid ? null : (
        <Alert
          color="secondary"
          variant="solid"
          title="Finish setting up your lineup"
          description={getMissingPositionsMessage(missingPositions)}
        />
      )}
    </div>
  );
}
