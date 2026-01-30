"use client";

import { format } from "date-fns";
import { CalendarClock, CalendarPlus, Download, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { EventInfoDiv } from "@/components/event-info-div";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addToGoogleCalendar, downloadICSFile } from "@/lib/calendar";
import type { Event } from "@/types/event";

import { Button } from "./ui/button";

export function AddToCalendarButton({ event }: { event: Event }) {
  const t = useTranslations("Event");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <EventInfoDiv className="hover:bg-accent/20 cursor-pointer">
          <CalendarPlus size={20} />
          <span className="hidden md:inline"> {t("addToCalendar")}</span>
        </EventInfoDiv>
      </DialogTrigger>
      <DialogContent className="max-w-85 md:max-w-100">
        <DialogTitle></DialogTitle>
        <div className="-mt-8 space-y-6">
          <div className="grid">
            <span className="break mb-2 max-w-80 text-3xl font-bold">
              {event.name}
            </span>
            <div className="flex items-start gap-3">
              <CalendarClock
                size={60}
                className="text-muted-foreground shrink-0"
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
              <div className="mt-4 flex items-center gap-2">
                <MapPin size={20} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{event.location}</span>
              </div>
            )}
          </div>

          <div className="grid gap-2 md:grid-cols-2">
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
                className="invert"
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
                className="invert"
                width={20}
                height={20}
              />
              Apple
            </Button>
            <Button
              onClick={(event_) => {
                event_.preventDefault();
                downloadICSFile(event);
              }}
              variant={"outline"}
              className="col-span-2 grow justify-start"
            >
              <Download size={20} />
              {t("download")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
