import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import {
  CalendarIcon,
  EyeIcon,
  MapPinIcon,
  NotePencilIcon,
  TrashIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { DateTime } from "luxon";

import type { Team } from "../queries";

const getTeamLocation = (city: string | null, state: string | null) => {
  if (city && state) {
    return `${city}, ${state}`;
  } else if (city) {
    return city;
  } else if (state) {
    return state;
  }
  return null;
};

export default function TeamListItem({
  id,
  name,
  admin_note,
  location_city,
  location_state,
  created_at,
  users: [{ count: numUsers }],
}: Team) {
  return (
    <Card key={id} as="li" className="list-none border border-divider" shadow="none">
      <CardBody>
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1">
              <p className="text-lg font-medium">{name}</p>
              {admin_note && <p className="text-sm italic text-default-500">{admin_note}</p>}
            </div>
            <div className="flex gap-1">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="primary"
                as={Link}
                href={`/team/${id}`}
              >
                <EyeIcon size={20} weight="duotone" />
              </Button>
              <Button isIconOnly size="sm" variant="light" className="text-default-500" isDisabled>
                <NotePencilIcon size={20} weight="duotone" />
              </Button>
              <Button isIconOnly size="sm" variant="light" color="danger" isDisabled>
                <TrashIcon size={20} weight="duotone" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-default-600">
            {getTeamLocation(location_city, location_state) && (
              <span className="flex items-center gap-1">
                <MapPinIcon size={16} weight="duotone" className="text-success" />
                {getTeamLocation(location_city, location_state)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <UsersIcon size={16} weight="duotone" className="text-warning" />
              {numUsers} member{numUsers !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-default-500">
            <CalendarIcon size={14} weight="duotone" />
            Created {DateTime.fromISO(created_at).toLocaleString(DateTime.DATE_MED)}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
