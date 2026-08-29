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
