import { startCase } from "lodash";

import { ListItem } from "@/components/List";
import { getOpponentPrefix } from "@/utils/display";

import { getOpponentTeam } from "./utils";

import type { PastGame } from "../../queries";

export default function PastGame(props: PastGame) {
  return (
    <ListItem>
      <ListItem.Content>
        <h3 className="font-bold">
          {getOpponentPrefix(props.role)} {getOpponentTeam(props)?.name}
        </h3>
        <h5 className="font-semibold uppercase text-small text-foreground-600">
          {props.game.name}
        </h5>
        <p className="text-foreground-500 text-small">{startCase(props.role)}</p>
      </ListItem.Content>
    </ListItem>
  );
}
