export type SetupStepKey = "enter-lineup" | "enter-opponent-lineup" | "enter-game-settings";

interface SetupStep {
  key: SetupStepKey;
  notCompletedText: string;
}

export const setupSteps: SetupStep[] = [
  {
    key: "enter-lineup",
    notCompletedText: "Enter your lineup",
  },
  {
    key: "enter-opponent-lineup",
    notCompletedText: "Enter the opponent's lineup",
  },
  {
    key: "enter-game-settings",
    notCompletedText: "Enter the game info",
  },
];
