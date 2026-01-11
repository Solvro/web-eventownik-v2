import { compareAsc, isBefore, isSameDay } from "date-fns";
import { format as formatDate } from "date-fns/format";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SanitizedContent } from "@/components/sanitized-content";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PHOTO_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Event as EventType } from "@/types/event";

function Event({
  name,
  organizer,
  description,
  startDate,
  endDate,
  photoUrl,
  slug,
}: {
  name: string;
  organizer: string | null;
  description: string | null;
  startDate: Date;
  endDate: Date;
  photoUrl: string | null;
  slug: string;
}) {
  const eventPhoto =
    photoUrl === null
      ? "/assets/event-photo-placeholder.png"
      : `${PHOTO_URL}/${photoUrl}`;

  // Helper to render date range using date-fns
  function renderDate() {
    const sameDay = isSameDay(startDate, endDate);

    return sameDay ? (
      <>
        {formatDate(startDate, "dd.MM")}
        <br />
        {formatDate(endDate, "yyyy")}
      </>
    ) : (
      // Multi-day event: show start date on top, end date on bottom
      <>
        <span>Od {formatDate(startDate, "dd.MM.yyyy")}</span>
        <br />
        <span>do {formatDate(endDate, "dd.MM.yyyy")}</span>
      </>
    );
  }

  // Determine event status
  function getEventStatus() {
    const now = new Date();
    if (now < startDate) {
      return {
        status: "Nadchodzące",
        style:
          "rounded-full bg-[#88FC61] px-5 py-2 text-center font-extrabold whitespace-nowrap text-[#487115] dark:bg-[#88FC61]/20 dark:text-[#88FC61]",
      };
    } else if (now >= startDate && now <= endDate) {
      return {
        status: "W trakcie",
        style:
          "rounded-full bg-[#4473E1]/20 px-5 py-2 text-center font-extrabold whitespace-nowrap text-[#4473E1] dark:text-[#84a9ff]",
      };
    } else {
      return {
        status: "Zakończone",
        style:
          "rounded-full bg-gray-300 px-5 py-2 text-center font-extrabold whitespace-nowrap text-gray-600 dark:bg-gray-700/80 dark:text-gray-300",
      };
    }
  }

  return (
    <div
      className={cn(
        "group flex h-full w-full justify-center px-4 py-8 text-black transition hover:bg-[#4473E1]/10 xl:h-128 xl:px-8 dark:text-white",
      )}
    >
      <div className="divide-input container flex flex-col gap-12 xl:flex-row xl:gap-16">
        {/* Mobile view only */}
        <div className="relative xl:hidden">
          <Image
            src={eventPhoto}
            alt={name}
            className="block aspect-video w-full rounded-4xl object-cover shadow-lg xl:hidden"
            width={1280}
            height={720}
          />
          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-start justify-between rounded-4xl bg-gradient-to-r from-black/60 to-transparent p-6 text-white">
            <p className={getEventStatus().style}>{getEventStatus().status}</p>
            <p className="text-left text-4xl font-semibold sm:text-5xl">
              {renderDate()}
            </p>
          </div>
        </div>
        {/* Changes for mobile view */}
        <div className="relative flex h-full w-full flex-row items-center gap-16">
          <div className="flex w-full flex-row gap-16">
            {/* Desktop view only */}
            <div className="hidden w-64 flex-col items-center gap-4 xl:flex">
              <p className="text-center text-4xl font-extrabold text-[#274276] dark:text-[#4473E1]">
                {renderDate()}
              </p>
              <p className={getEventStatus().style}>
                {getEventStatus().status}
              </p>
            </div>
            <div className="flex flex-col gap-12 xl:w-[calc(100%-40rem)] 2xl:w-[calc(100%-48rem)]">
              <div className="w-full space-y-6">
                <p className="text-4xl font-semibold">{name}</p>
                <p className="text-sm font-medium">{organizer}</p>
                <ScrollArea className="h-38 pr-3 text-justify">
                  <SanitizedContent contentToSanitize={description ?? ""} />
                </ScrollArea>
              </div>
              <Button
                asChild
                variant={"secondary"}
                className="border-input/20 flex w-full items-center justify-center rounded-full border bg-[#d6d6d6] text-black group-hover:bg-[#4473E1] group-hover:text-white group-hover:hover:bg-[#3458ae] lg:w-min"
              >
                <Link href={`/${slug}`}>
                  Sprawdź
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
          </div>
          {/* Desktop view only */}
          <Image
            src={eventPhoto}
            alt={name}
            className="absolute right-0 hidden aspect-video h-full w-auto translate-x-5/7 rounded-4xl object-cover shadow-lg transition xl:block xl:group-hover:translate-x-5/8 2xl:group-hover:translate-x-1/2"
            width={1280}
            height={720}
          />
        </div>
      </div>
    </div>
  );
}

export function EventList({ events }: { events: EventType[] | undefined }) {
  return (
    <section id="events" className="flex flex-col">
      <div className="border-input z-10 flex w-full flex-col divide-y-[1px] border-b bg-white dark:bg-[#101011]">
        {events != null && events.length > 0 ? (
          events
            .toSorted((a, b) => {
              const now = new Date();
              const aIsFinished = isBefore(new Date(a.endDate), now);
              const bIsFinished = isBefore(new Date(b.endDate), now);

              if (aIsFinished && !bIsFinished) {
                return 1;
              }
              if (!aIsFinished && bIsFinished) {
                return -1;
              }

              return compareAsc(new Date(a.startDate), new Date(b.startDate));
            })
            .map((event) => (
              <Event
                key={event.slug}
                name={event.name}
                organizer={event.organizer}
                description={event.description}
                startDate={new Date(event.startDate)}
                endDate={new Date(event.endDate)}
                photoUrl={event.photoUrl}
                slug={event.slug}
              />
            ))
        ) : (
          <div className="flex h-64 w-full items-center justify-center text-gray-500 dark:text-gray-400">
            <p className="text-xl">Brak wydarzeń w wybranym miesiącu</p>
          </div>
        )}
      </div>
      {/*
      <div className="clip-curve flex w-full flex-col items-center justify-center bg-white p-4 dark:bg-[#101011]">
        <Button
          variant={"outline"}
          className="rounded-full border-black bg-transparent text-black transition hover:bg-[#d6d6d6]/50 hover:text-black dark:border-white dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
        >
          <CircleChevronDown />
          Pokaż więcej
        </Button>
      </div>*/}
    </section>
  );
}
