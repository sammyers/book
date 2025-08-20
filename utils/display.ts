import { DateTime } from "luxon";

import type { Enums, Tables } from "./supabase/database.types";

export type FieldingPosition = Enums<"fielding_position">;

export const getPositionAbbreviation = (position: FieldingPosition) => {
  switch (position) {
    case "pitcher":
      return "P";
    case "catcher":
      return "C";
    case "first_base":
      return "1B";
    case "second_base":
      return "2B";
    case "third_base":
      return "3B";
    case "shortstop":
      return "SS";
    case "left_field":
      return "LF";
    case "center_field":
      return "CF";
    case "right_field":
      return "RF";
    case "left_center_field":
      return "LCF";
    case "right_center_field":
      return "RCF";
    case "middle_infield":
      return "MI";
    case "extra_hitter":
      return "EH";
  }
};

export type Player = Omit<Tables<"player">, "created_at">;

export function getPositions(
  player: Pick<Tables<"player">, "primary_position" | "secondary_position">,
) {
  if (!player.secondary_position) {
    return getPositionAbbreviation(player.primary_position);
  }
  return `${getPositionAbbreviation(player.primary_position)}/${getPositionAbbreviation(player.secondary_position)}`;
}

export const getOpponentPrefix = (role: Enums<"team_role">) => {
  switch (role) {
    case "home":
      return "vs.";
    case "away":
      return "@";
  }
};

export function formatDateRange(
  { start, end }: { start: DateTime; end: DateTime },
  now: DateTime = DateTime.now(),
  options: { shortMonths?: boolean } = {},
) {
  const { shortMonths = true } = options;
  const monthFormat = shortMonths ? "MMM" : "MMMM";
  const dateFormat = shortMonths ? "MMM d" : "MMMM d";
  const fullDateFormat = shortMonths ? "MMM d, yyyy" : "MMMM d, yyyy";

  // If start and end are the same, just return the start date
  if (start.equals(end)) {
    return formatSingleDate(start, now, { shortMonths });
  }

  const currentYear = now.year;
  const startYear = start.year;
  const endYear = end.year;
  const startMonth = start.month;
  const endMonth = end.month;

  // If both dates are in the same month and year
  if (startMonth === endMonth && startYear === endYear) {
    const monthName = start.toFormat(monthFormat);
    const startDay = start.day;
    const endDay = end.day;

    // Only show year if it's not the current year
    const yearSuffix = startYear !== currentYear ? `, ${startYear}` : "";

    return `${monthName} ${startDay}-${endDay}${yearSuffix}`;
  }

  // If dates are in different months but same year
  if (startYear === endYear) {
    const startMonthName = start.toFormat(dateFormat);
    const endMonthName = end.toFormat(dateFormat);

    // Only show year if it's not the current year
    const yearSuffix = startYear !== currentYear ? `, ${startYear}` : "";

    return `${startMonthName} - ${endMonthName}${yearSuffix}`;
  }

  // If dates are in different years
  return `${start.toFormat(fullDateFormat)} - ${end.toFormat(fullDateFormat)}`;
}

function formatSingleDate(
  date: DateTime,
  now: DateTime = DateTime.now(),
  options: { shortMonths?: boolean } = {},
) {
  const { shortMonths = true } = options;
  const currentYear = now.year;
  const dateYear = date.year;

  // Only show year if it's not the current year
  if (dateYear !== currentYear) {
    return date.toFormat(shortMonths ? "MMM d, yyyy" : "MMMM d, yyyy");
  }

  return date.toFormat(shortMonths ? "MMM d" : "MMMM d");
}
