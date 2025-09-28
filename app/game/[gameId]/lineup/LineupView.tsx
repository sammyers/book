import { useSearchParams } from "next/navigation";

import { getSelectedTeamId } from "../_store/selectors";
import { useGameStore } from "../_store/store";
import { Bench } from "./Bench";
import { LineupViewProvider } from "./context";
import { DndWrapper } from "./DndWrapper";
import { LineupTeamSelector } from "./LineupTeamSelector";
import { OpponentLineup } from "./OpponentLineup";
import { SetupHeader } from "./SetupHeader";
import { TeamLineup } from "./TeamLineup";
import { TeamRoster } from "./TeamRoster";

function PrimaryTeamLineup() {
  return (
    <>
      <SetupHeader isVisible={false} />
      <DndWrapper>
        <div className="flex flex-col gap-4 md:flex-row">
          <TeamRoster />
          <div className="flex flex-col gap-4 grow basis-0">
            <TeamLineup />
            <Bench />
          </div>
        </div>
      </DndWrapper>
    </>
  );
}

export function LineupView() {
  const searchParams = useSearchParams();
  const primaryTeamId = searchParams.get("teamId")!;

  const selectedTeamId = useGameStore(getSelectedTeamId);

  return (
    <div className="pt-14 p-3 overflow-auto">
      <LineupTeamSelector primaryTeamId={primaryTeamId} />
      <LineupViewProvider teamId={selectedTeamId}>
        {selectedTeamId === primaryTeamId && <SetupHeader />}
        {selectedTeamId === primaryTeamId ? <PrimaryTeamLineup /> : <OpponentLineup />}
      </LineupViewProvider>
    </div>
  );
}
