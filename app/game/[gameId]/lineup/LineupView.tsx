import { useSearchParams } from "next/navigation";

import { Bench } from "./Bench";
import { LineupViewProvider } from "./context";
import { DndWrapper } from "./DndWrapper";
import { TeamLineup } from "./TeamLineup";
import { TeamRoster } from "./TeamRoster";

export function LineupView() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId")!;

  return (
    <LineupViewProvider teamId={teamId}>
      <DndWrapper>
        <div className="flex flex-col gap-4 md:flex-row p-3 overflow-auto">
          <TeamRoster />
          <div className="flex flex-col gap-4 grow basis-0">
            <TeamLineup />
            <Bench />
          </div>
        </div>
      </DndWrapper>
    </LineupViewProvider>
  );
}
