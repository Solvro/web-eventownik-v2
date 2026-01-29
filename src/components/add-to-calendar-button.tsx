"use client";

import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { EventInfoDiv } from "@/components/event-info-div";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addToGoogleCalendar, downloadICSFile } from "@/lib/calendar";
import type { Event } from "@/types/event";

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
