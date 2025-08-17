import { Card, CardBody } from "@heroui/card";
import { addToast, Button, cn } from "@heroui/react";
import { CheckIcon, UserCirclePlusIcon } from "@phosphor-icons/react";
import { startTransition, useActionState, useCallback, useEffect, useMemo, useRef } from "react";
import { tv } from "tailwind-variants";

import { PlayerPositionChip } from "@/components/PlayerPositionChip";
import { useSyncedRef } from "@/utils/hooks/useSyncedRef";

import { addPlayerToTeam } from "../../../actions";

import type { PlayerSearchResult } from "../../../queries";

interface PlayerSearchItemProps {
  player: PlayerSearchResult;
  currentTeamId: string;
  wasJustAdded: boolean;
  onPlayerAdded: () => void;
}

const variants = tv({
  base: "border border-divider",
  variants: {
    wasJustAdded: {
      true: "border-success/50 bg-success-50",
    },
    isOnCurrentTeam: {
      true: "bg-default-100 border-default-200 opacity-65",
    },
  },
});

export default function PlayerSearchItem({
  player,
  currentTeamId,
  wasJustAdded,
  onPlayerAdded: onPlayerAddedProp,
}: PlayerSearchItemProps) {
  const isOnCurrentTeam = player.teams.some(team => team.id === currentTeamId);

  const classes = variants({
    wasJustAdded,
    isOnCurrentTeam,
  });

  const currentTeamText = useMemo(() => {
    if (isOnCurrentTeam) {
      return "Already on Roster";
    }
    return `Current Team${player.teams.length > 1 ? "s" : ""}: ${player.teams.map(team => team.name).join(", ")}`;
  }, [player.teams, isOnCurrentTeam]);

  const [addPlayerState, addPlayerAction, isAddingPlayer] = useActionState(addPlayerToTeam, null);

  const { current: onPlayerAdded } = useSyncedRef(onPlayerAddedProp);
  const toastShown = useRef(false);

  useEffect(() => {
    console.log(addPlayerState);
    if (toastShown.current) {
      return;
    }
    if (addPlayerState?.status === "success") {
      toastShown.current = true;
      onPlayerAdded();
      addToast({
        title: "Player added to roster",
        description: addPlayerState.message,
        color: "success",
      });
    } else if (addPlayerState?.status === "error") {
      toastShown.current = true;
      addToast({
        title: "Error adding player to roster",
        description: addPlayerState.message,
        color: "danger",
      });
    }
  }, [addPlayerState, onPlayerAdded]);

  const makeAddButton = useCallback(
    ({ isMobile }: { isMobile: boolean }) => {
      const icon = wasJustAdded ? <CheckIcon size={16} /> : <UserCirclePlusIcon size={16} />;

      return (
        <Button
          variant="flat"
          color={wasJustAdded ? "success" : "primary"}
          onPress={() =>
            startTransition(() => {
              addPlayerAction({
                playerId: player.id,
                teamId: currentTeamId,
              });
            })
          }
          isLoading={isAddingPlayer}
          isDisabled={wasJustAdded}
          startContent={isMobile ? undefined : icon}
          isIconOnly={isMobile}
          className={cn("shrink-0", isMobile ? "sm:hidden inline-flex" : "hidden sm:inline-flex")}
        >
          {isMobile ? icon : "Add to Roster"}
        </Button>
      );
    },
    [player.id, currentTeamId, wasJustAdded, isAddingPlayer, addPlayerAction],
  );

  return (
    <Card shadow="none" className={classes}>
      <CardBody>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <p className="font-medium">{player.name}</p>
                {player.nickname && (
                  <p className="text-sm text-default-500">&quot;{player.nickname}&quot;</p>
                )}
              </div>
              <PlayerPositionChip {...player} />
            </div>
            <p className="text-xs text-default-400">{currentTeamText}</p>
          </div>
          {(!isOnCurrentTeam || wasJustAdded) && (
            <>
              {makeAddButton({ isMobile: true })}
              {makeAddButton({ isMobile: false })}
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
