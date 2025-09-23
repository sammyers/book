import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Bench } from "./Bench";
import { LineupViewProvider } from "./context";
import { DndWrapper } from "./DndWrapper";
import { LineupTeamSelector } from "./LineupTeamSelector";
import { TeamLineup } from "./TeamLineup";
import { TeamRoster } from "./TeamRoster";

export function LineupView() {
  const searchParams = useSearchParams();
  const primaryTeamId = searchParams.get("teamId")!;

  const [selectedTeamId, setSelectedTeamId] = useState(primaryTeamId);

  return (
    <LineupViewProvider teamId={selectedTeamId}>
      <LineupTeamSelector
        primaryTeamId={primaryTeamId}
        selectedTeamId={selectedTeamId}
        setSelectedTeamId={setSelectedTeamId}
      />
      <DndWrapper>
        <div className="pt-14 flex flex-col gap-4 md:flex-row p-3 overflow-auto">
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
