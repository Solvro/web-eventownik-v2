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
      <DialogContent className="w-80">
        <DialogTitle>{t("addToCalendar")}</DialogTitle>
        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            <Button
              onClick={(event_) => {
                event_.preventDefault();
                addToGoogleCalendar(event);
              }}
              variant={"outline"}
              className="justify-start"
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
              className="justify-start"
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
