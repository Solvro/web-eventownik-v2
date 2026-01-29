"use client";

import { createEvent } from "ics";
import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { EventInfoDiv } from "@/components/event-info-div";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

function addToGoogleCalendar(event: Event) {
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

export function AddToCalendarButton({ event }: { event: Event }) {
  const t = useTranslations("Event");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <EventInfoDiv className="hover:bg-accent/20 cursor-pointer">
          <CalendarPlus size={20} />
          <span className="hidden md:inline"> {t("addToCalendar")}</span>
        </EventInfoDiv>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="leading-none font-medium">Add to Calendar</h4>
          <div className="flex flex-col gap-2">
            <button
              onClick={(event_) => {
                event_.preventDefault();
                addToGoogleCalendar(event);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Google Calendar
            </button>
            <button
              onClick={(event_) => {
                event_.preventDefault();
                downloadICSFile(event);
              }}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Apple Calendar (.ics)
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
