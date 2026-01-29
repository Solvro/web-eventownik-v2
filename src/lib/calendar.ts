import { createEvent } from "ics";

import type { Event } from "@/types/event";

import { downloadFile } from "./utils";

export function downloadICSFile(event: Event) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const { error, value } = createEvent({
    title: event.name,
    description: event.description ?? undefined,
    start: [
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
    ],
    end: [
      endDate.getFullYear(),
      endDate.getMonth() + 1,
      endDate.getDate(),
      endDate.getHours(),
      endDate.getMinutes(),
    ],
    location: event.location ?? undefined,
    status: "CONFIRMED",
    url: `https://eventownik.solvro.pl/${event.slug}`,
  });
  if (error != null || value == null) {
    console.error("Error creating ICS file:", error);
    return;
  }
  downloadFile(
    new Blob([value], { type: "text/calendar" }),
    `${event.name.replaceAll(/[^a-zA-Z0-9]/g, "_")}.ics`,
  );
}

export function addToGoogleCalendar(event: Event) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const formatDate = (date: Date) => {
    return `${date.toISOString().replaceAll(/[-:]/g, "").split(".")[0]}Z`;
  };

  const parameters = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description ?? "",
    location: event.location ?? "",
    sprop: `website:https://eventownik.solvro.pl/${event.slug}`,
  });

  window.open(
    `https://calendar.google.com/calendar/render?${parameters.toString()}`,
    "_blank",
  );
}
