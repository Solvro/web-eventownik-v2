"use client";

import { format } from "date-fns";
import { CalendarClock, CalendarPlus, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { EventInfoDiv } from "@/components/event-info-div";
import {
  Credenza,
  CredenzaContent,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import { addToGoogleCalendar, downloadICSFile } from "@/lib/calendar";
import type { Event } from "@/types/event";

import { Button } from "./ui/button";

export function AddToCalendarButton({ event }: { event: Event }) {
  const t = useTranslations("Event");
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <EventInfoDiv className="hover:bg-accent/20 cursor-pointer">
          <CalendarPlus size={20} />
          <span className="hidden md:inline"> {t("addToCalendar")}</span>
        </EventInfoDiv>
      </CredenzaTrigger>
      <CredenzaContent className="max-w-md md:w-95/100">
        <CredenzaTitle className="sr-only">{t("addToCalendar")}</CredenzaTitle>
        <div className="space-y-6 p-4 md:p-0">
          <div className="grid">
            <span className="break mb-2 max-w-80 truncate text-3xl font-bold">
              {event.name}
            </span>
            <div className="flex items-start gap-3">
              <CalendarClock
                size={60}
                className="text-muted-foreground shrink-0 stroke-1"
              />
              <div>
                <div className="font-medium">
                  {format(event.startDate, "dd.MM.yyyy")} -{" "}
                  {format(event.endDate, "dd.MM.yyyy")}
                </div>
                <div className="text-muted-foreground text-sm">
                  {format(event.startDate, "HH.mm")} -{" "}
                  {format(event.endDate, "HH:mm")}
                </div>
              </div>
            </div>

            {event.location == null ? null : (
              <div className="mt-4 flex items-start gap-2">
                <MapPin
                  size={20}
                  className="text-muted-foreground mt-0.5 shrink-0"
                />
                <span className="text-muted-foreground line-clamp-2">
                  {event.location}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={(event_) => {
                event_.preventDefault();
                addToGoogleCalendar(event);
              }}
              variant={"outline"}
              className="grow justify-start"
            >
              <Image
                src="/assets/logo/googlecalendar.svg"
                alt="Google Calendar"
                className="dark:invert"
                width={20}
                height={20}
              />
              Google
            </Button>
            <Button
              onClick={(event_) => {
                event_.preventDefault();
                downloadICSFile(event);
              }}
              variant={"outline"}
              className="grow justify-start"
            >
              <Image
                src="/assets/logo/apple.svg"
                alt="Apple"
                className="dark:invert"
                width={20}
                height={20}
              />
              Apple
            </Button>
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}
