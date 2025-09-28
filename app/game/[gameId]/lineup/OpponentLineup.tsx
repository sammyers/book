import { Card, CardBody, CardHeader } from "@heroui/card";
import { Radio, RadioGroup } from "@heroui/radio";
import { Chip, cn } from "@heroui/react";
import { SlidersIcon, TrafficConeIcon } from "@phosphor-icons/react";
import { useCallback } from "react";

import { CardTitle } from "@/components/CardTitle";
import { SavingStatus } from "@/components/SavingStatus";

import { getGameDataStatus, getOpponentLineupMode } from "../_store/selectors";
import { useGameStore } from "../_store/store";
import { useSaveGameData } from "../gameData";

import type { OpponentLineupMode } from "@/utils/game/metadata";
import type { RadioProps } from "@heroui/radio";

function CustomRadio({ children, ...props }: RadioProps) {
  return (
    <Radio
      {...props}
      classNames={{
        base: cn(
          "inline-flex m-0 hover:opacity-70 items-center justify-between",
          "flex-row-reverse w-full sm:max-w-[360px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-default",
          "data-[selected=true]:border-primary",
        ),
      }}
    >
      {children}
    </Radio>
  );
}

export function OpponentLineup() {
  const opponentLineupMode = useGameStore(getOpponentLineupMode);
  const status = useGameStore(getGameDataStatus);
  const updateOpponentLineupMode = useGameStore(state => state.updateOpponentLineupMode);

  const saveGameData = useSaveGameData({ errorTitle: "Error saving opponent lineup settings" });

  const handleChange = useCallback(
    (value: OpponentLineupMode) => {
      updateOpponentLineupMode(value);
      saveGameData();
    },
    [updateOpponentLineupMode, saveGameData],
  );

  return (
    <div className="flex flex-col items-center">
      <Card shadow="sm">
        <CardHeader className="pb-0 justify-between">
          <CardTitle className="bg-content1">
            <SlidersIcon size={24} weight="duotone" />
            <p>Opponent Lineup</p>
          </CardTitle>
          <SavingStatus status={{ ...status, preventSaving: false }} />
        </CardHeader>
        <CardBody className="p-4">
          <RadioGroup
            aria-label="Lineup Type"
            value={opponentLineupMode}
            onValueChange={value => handleChange(value as OpponentLineupMode)}
            label="Select a scorekeeping mode:"
            classNames={{
              label: "text-center text-sm text-default-400 font-medium",
            }}
          >
            <CustomRadio
              value="runs-only"
              description="Enter only the number of runs scored each inning by the opposing team."
            >
              Runs Only
            </CustomRadio>
            <CustomRadio
              value="minimal"
              description="Enter the result of each at-bat by the opposing team."
            >
              Minimal
            </CustomRadio>
            <CustomRadio
              isDisabled
              value="detailed"
              description="Fill out a lineup for the opposing team and record the result of each at-bat."
            >
              <div className="flex items-center gap-2">
                <span>Detailed</span>
                <Chip
                  color="warning"
                  variant="flat"
                  size="sm"
                  startContent={<TrafficConeIcon size={16} />}
                >
                  Coming soon!
                </Chip>
              </div>
            </CustomRadio>
          </RadioGroup>
        </CardBody>
      </Card>
    </div>
  );
}
