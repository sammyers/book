"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { NumberInput } from "@heroui/number-input";
import { Slider } from "@heroui/slider";
import { Switch } from "@heroui/switch";
import { SlidersIcon } from "@phosphor-icons/react";
import { useCallback } from "react";

import { CardTitle } from "@/components/CardTitle";
import { SavingStatus } from "@/components/SavingStatus";

import { getGameConfiguration, getGameDataStatus } from "../_store/selectors";
import { useGameStore } from "../_store/store";
import { useSaveGameData } from "../gameData";

import type { GameConfiguration } from "@/utils/game/metadata";

export function SettingsView() {
  const gameConfiguration = useGameStore(getGameConfiguration);
  const updateGameConfiguration = useGameStore(store => store.updateGameConfiguration);
  const status = useGameStore(getGameDataStatus);

  const saveGameData = useSaveGameData({ errorTitle: "Error saving game settings" });

  const handleChange = useCallback(
    (values: Partial<GameConfiguration>) => {
      updateGameConfiguration(values);
      saveGameData();
    },
    [updateGameConfiguration, saveGameData],
  );

  return (
    <div className="pt-14 p-3 overflow-auto">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <Card>
          <CardHeader className="justify-between">
            <CardTitle className="bg-content1">
              <SlidersIcon size={24} />
              <p>Game Settings</p>
            </CardTitle>
            <SavingStatus status={{ ...status, preventSaving: false }} />
          </CardHeader>
          <CardBody className="p-4 flex flex-col gap-6">
            {/* Game Length - Innings */}
            <div className="flex flex-col gap-2">
              {/* <label className="text-sm font-medium"></label> */}
              <Slider
                label="Game Length (Innings)"
                value={gameConfiguration.gameLengthInnings}
                onChange={value => handleChange({ gameLengthInnings: value as number })}
                minValue={3}
                maxValue={9}
                step={1}
                classNames={{ label: "font-medium", value: "font-bold" }}
                renderValue={props => (
                  <Chip color="primary">
                    <output {...props} />
                  </Chip>
                )}
              />
            </div>

            <Divider />

            {/* Game Length - Minutes */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Time Limit</label>
                <Switch
                  isSelected={gameConfiguration.gameLengthMinutes !== null}
                  onValueChange={enabled =>
                    handleChange({
                      gameLengthMinutes: enabled ? 50 : null,
                    })
                  }
                />
              </div>
              {gameConfiguration.gameLengthMinutes !== null && (
                <NumberInput
                  value={gameConfiguration.gameLengthMinutes}
                  onValueChange={value => handleChange({ gameLengthMinutes: value })}
                  minValue={15}
                  maxValue={120}
                  step={5}
                  label="Minutes"
                  className="sm:max-w-xs"
                />
              )}
            </div>

            <Divider />

            {/* Home Run Limit */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Home Run Limit</label>
                <Switch
                  isSelected={gameConfiguration.homeRunLimit !== null}
                  onValueChange={enabled =>
                    handleChange({
                      homeRunLimit: enabled ? 1 : null,
                    })
                  }
                />
              </div>
              {gameConfiguration.homeRunLimit !== null && (
                <NumberInput
                  value={gameConfiguration.homeRunLimit}
                  onValueChange={value => handleChange({ homeRunLimit: value })}
                  minValue={0}
                  maxValue={15}
                  step={1}
                  label="Home runs per team"
                  className="sm:max-w-xs"
                />
              )}
              <p className="text-sm text-default-400">
                Limit the number of home runs each team is allowed. Once the limit is reached,
                additional fair balls over the fence become DBOs (dead ball outs).
              </p>
            </div>

            <Divider />

            {/* Game Rules */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium text-default-500">Game Rules</h3>

              <div className="flex flex-col gap-2">
                <Switch
                  isSelected={gameConfiguration.allowDHH}
                  onValueChange={enabled => handleChange({ allowDHH: enabled })}
                >
                  DHH (Designated Home run Hitter)
                </Switch>
                <p className="text-sm text-default-400 ml-8">
                  Each team designates a hitter to whom the home run limit doesn&apos;t apply.
                  Walking the DHH grants the batting team an additional home run until the DHH bats
                  again.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Switch
                  isSelected={gameConfiguration.allowInningEndingDBOs}
                  onValueChange={enabled => handleChange({ allowInningEndingDBOs: enabled })}
                >
                  Inning Ending DBOs
                </Switch>
                <p className="text-sm text-default-400 ml-8">
                  Hitting a fair ball over the fence after the team&apos;s home run limit is reached
                  will end the inning regardless of the number of outs.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Switch
                    isSelected={gameConfiguration.allowFlipFlop}
                    onValueChange={enabled => handleChange({ allowFlipFlop: enabled })}
                  >
                    Allow Flip Flop
                  </Switch>
                  <p className="text-sm text-default-400 ml-8">
                    When beginning a new inning, if the away team&apos;s lead would qualify for a
                    mercy rule at the end of that inning, the home team becomes the away team and
                    bats again. The leading team becomes the home team for the remainder of the
                    game.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Switch
                    isSelected={gameConfiguration.allowTies}
                    onValueChange={enabled => handleChange({ allowTies: enabled })}
                  >
                    Allow Ties
                  </Switch>
                  <p className="text-sm text-default-400 ml-8">
                    Allow games to end in a tie when the time or inning limit is reached. Otherwise,
                    the game will proceed to extra innings.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Switch
                    isSelected={gameConfiguration.require10BatterMinimum}
                    onValueChange={enabled => handleChange({ require10BatterMinimum: enabled })}
                  >
                    Require 10 Batter Minimum
                  </Switch>
                  <p className="text-sm text-default-400 ml-8">
                    If a team bats fewer than 10 players, they will take an automatic out for each
                    missing batter at the bottom of their lineup.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
