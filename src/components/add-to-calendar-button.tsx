"use client";

import { createEvent } from "ics";
import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { EventInfoDiv } from "@/components/event-info-div";
import { downloadFile } from "@/lib/utils";
import type { Event } from "@/types/event";

function downloadICSFile(event: Event) {
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

export function AddToCalendarButton({ event }: { event: Event }) {
  const t = useTranslations("Event");
  return (
    <EventInfoDiv
      onClick={(event_) => {
        event_.preventDefault();
        downloadICSFile(event);
      }}
      className="hover:bg-accent/20 cursor-pointer"
    >
      <CalendarPlus size={20} />
      <span className="hidden md:inline"> {t("addToCalendar")}</span>
    </EventInfoDiv>
  );
}
