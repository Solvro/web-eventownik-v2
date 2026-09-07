import { format } from "date-fns";

import type { Payload } from "@/app/dashboard/events/[uuid]/forms/actions";
import type { EventForm } from "@/types/forms";

/**
 * Combines a date with a time and returns a new Date object.
 *
 * @param date - The date to use as the base
 * @param time - The time in `HH:mm` format
 * @returns A new Date object with the specified date and time
 */
export function combineDateAndTime(date: Date, time: string) {
  const result = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);

  result.setHours(hours, minutes, 0, 0);

  return result;
}

export function isFormOpen(form: EventForm): boolean {
  if (form.openCondition === "MANUAL") {
    return form.isOpen;
  }

  const now = new Date();

  return (
    form.openDate !== null &&
    form.closeDate !== null &&
    now >= new Date(form.openDate) &&
    now <= new Date(form.closeDate)
  );
}

/**
 * Resolves the close date and time of a form based on its open condition
 *
 * @returns The ISO string representation of the combined close date and time if the open condition is "ON_DATE", otherwise null
 */
export function resolveFormDateTime(form: Payload): string | null {
  return form.openCondition === "ON_DATE"
    ? combineDateAndTime(form.closeDate, form.closeTime).toISOString()
    : null;
}

/**
 * Returns form dates and corresponding time values.
 *
 * If `openDate` is not provided, the default opening date is tomorrow
 * with a default time of "12:00".
 * If `closeDate` is not provided, it is set to one day after the
 * resolved opening date with a default time of "12:00".
 *
 * @param openDate - Opening date or `null` to use the default value.
 * @param closeDate - Closing date or `null` to calculate it from the opening date.
 * @returns Form date objects and time strings (HH:mm) for opening and closing.
 */
export function getDefaultFormDates(
  openDate: Date | null = null,
  closeDate: Date | null = null,
) {
  const resolvedOpenDate =
    openDate ?? new Date(new Date().setHours(24, 0, 0, 0));

  const resolvedCloseDate = closeDate ?? new Date(resolvedOpenDate);

  if (closeDate === null) {
    resolvedCloseDate.setDate(resolvedCloseDate.getDate() + 1);
  }

  return {
    openDate: resolvedOpenDate,
    closeDate: resolvedCloseDate,
    openTime: openDate === null ? "12:00" : format(openDate, "HH:mm"),
    closeTime: closeDate === null ? "12:00" : format(closeDate, "HH:mm"),
  };
}
