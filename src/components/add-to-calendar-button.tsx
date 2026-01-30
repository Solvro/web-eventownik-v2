"use client";

import { CalendarPlus, Download } from "lucide-react";
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
      <DialogContent className="max-w-75 md:max-w-100">
        <DialogTitle>{t("addToCalendar")}</DialogTitle>
        <div className="space-y-2">
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
              <Download size={20} />
              {t("download")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
