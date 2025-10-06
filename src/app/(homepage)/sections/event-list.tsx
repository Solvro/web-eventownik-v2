"use client";

import { format as formatDate, isSameDay } from "date-fns";
import { ArrowLeftCircle, ArrowRightCircle, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { Event as EventType } from "@/types/event";

import { Button } from "../../../components/ui/button";

function TimelineStep({
  month,
  monthNumber,
  isActive,
  onClick,
}: {
  month: string;
  monthNumber: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={cn(
          "text-4xl uppercase transition",
          isActive
            ? "font-extrabold text-[#3458ae] dark:text-[#7294e2]"
            : "font-semibold",
        )}
      >
        {month}
      </button>
      <div className="flex flex-row items-end gap-6">
        {Array.from({ length: 11 }).map((_, index) => (
          <span
            className={cn(
              "block",
              // Make the lines transparent if they are out of bounds
              (index < 5 && monthNumber === 0) ||
                (index > 5 && monthNumber === 11)
                ? "bg-transparent"
                : "bg-[#414141] dark:bg-[#d6d6d6]",
              // Full line for under the month
              index === 5
                ? "h-10 w-px"
                : // Remove the last line so they won't stack up
                  index === 10 && monthNumber !== 11
                  ? "w-0"
                  : "h-5 w-px",
            )}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

function Timeline({
  month,
  setMonth,
}: {
  month: number;
  setMonth: (month: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Get the width of the timeline
  useLayoutEffect(() => {
    if (ref.current != null) {
      setWidth(ref.current.offsetWidth);
    }
  }, [ref]);

  const months = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];

  return (
    <div className="relative flex h-22 w-full flex-col items-center">
      <div className="absolute flex w-full flex-row justify-between px-8">
        <Button
          variant={"eventGhost"}
          size={"icon"}
          className="z-10 hover:bg-transparent [&_svg]:size-8"
          onClick={() => {
            setMonth(Math.max(month - 1, 0));
          }}
        >
          <ArrowLeftCircle />
        </Button>
        <Button
          variant={"eventGhost"}
          size={"icon"}
          className="z-10 hover:bg-transparent [&_svg]:size-8"
          onClick={() => {
            setMonth(Math.min(month + 1, 11));
          }}
        >
          <ArrowRightCircle />
        </Button>
      </div>
      <div className="faded-edges relative flex h-22 w-full flex-col items-center">
        <motion.div
          ref={ref}
          animate={{
            x: width / -24 - month * (width / 12),
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
          className="absolute flex shrink-0 translate-x-1/2 flex-row"
        >
          {months.map((monthName, index) => (
            <TimelineStep
              key={monthName}
              month={monthName}
              monthNumber={index}
              isActive={index === month}
              onClick={() => {
                setMonth(index);
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

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
  const eventPhoto = photoUrl ?? "/assets/event-photo-placeholder.png";

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
      return "Nadchodzące";
    } else if (now >= startDate && now <= endDate) {
      return "W trakcie";
    } else {
      return "Zakończone";
    }
  }

  const eventStatus = getEventStatus();

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
            <p
              className={
                eventStatus === "W trakcie"
                  ? "rounded-full bg-[#4473E1] px-5 py-2 text-center font-extrabold whitespace-nowrap text-white dark:bg-[#3458ae] dark:text-white"
                  : "rounded-full bg-[#88FC61] px-5 py-2 text-center font-extrabold whitespace-nowrap text-[#487115] dark:bg-[#88FC61]/20 dark:text-[#88FC61]"
              }
            >
              {eventStatus}
            </p>
            <p className="text-left text-4xl font-semibold sm:text-5xl">
              {renderDate()}
            </p>
          </div>
        </div>
        {/* Changes for mobile view */}
        <div className="relative flex h-full w-full flex-row items-center gap-16">
          <div className="flex flex-row gap-16">
            {/* Desktop view only */}
            <div className="hidden w-64 flex-col items-center gap-4 xl:flex">
              <p className="text-center text-4xl font-extrabold text-[#274276] dark:text-[#4473E1]">
                {renderDate()}
              </p>
              <p
                className={
                  eventStatus === "W trakcie"
                    ? "rounded-full bg-[#4473E1]/20 px-5 py-2 text-center font-extrabold whitespace-nowrap text-[#4473E1] dark:text-[#84a9ff]"
                    : eventStatus === "Zakończone"
                      ? "rounded-full bg-gray-300 px-5 py-2 text-center font-extrabold whitespace-nowrap text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      : "rounded-full bg-[#88FC61] px-5 py-2 text-center font-extrabold whitespace-nowrap text-[#487115] dark:bg-[#88FC61]/20 dark:text-[#88FC61]"
                }
              >
                {eventStatus}
              </p>
            </div>
            <div className="flex flex-col gap-12 xl:w-[calc(100%-40rem)] 2xl:w-[calc(100%-48rem)]">
              <div className="w-full space-y-6">
                <p className="text-4xl font-semibold">{name}</p>
                <p className="text-sm font-medium">{organizer}</p>
                <p className="text-xl">{description}</p>
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

const events: EventType[] = [
  {
    id: 1,
    organizerId: 1,
    name: 'Neurohackathon "Heroes of the Brain" 2025',
    description:
      "Heroes of the Brain is a 24-hour programming marathon organized by the Scientific Research Group Neuron and the WIT Faculty Students Union, bringing together enthusiasts of neuroinformatics and artificial intelligence. 🧠🤖 Teams participating in the event will have to create a solution using brain-computer interfaces (BCI), related to one of the topics prepared by the organizers. After the event, the best implementations will be selected, and prizes will await the winners!",
    slug: "neurohackaton-2025",
    startDate: "2025-11-29T00:00:00.000Z",
    endDate: "2025-11-30T11:59:59.000Z",
    firstFormId: 1,
    location: "Wrocław",
    primaryColor: "#3458ae",
    organizer: "KN Neuron, WRSS W4",
    participantsCount: 0,
    contactEmail: null,
    socialMediaLinks: null,
    createdAt: "",
    updatedAt: "",
    photoUrl: "/assets/landing/event-list/neurohackathon-2025.png",
    firstForm: null,
  },
  {
    id: 1,
    organizerId: 1,
    name: "Wakacyjne Wyzwanie Solvro",
    description:
      "Wakacyjne Wyzwanie Solvro - znajdź dobre połączenie! • 📆 Czas trwania: 8 tygodni (08-09.2025) • 💻 Forma: online – cotygodniowe spotkania + praktyczne zadania • 🎯 Dla kogo: studenci i licealiści • 🧩 Liczba ścieżek: 8 • 🆓 Udział: całkowicie darmowy",
    slug: "wakacyjne-wyzwanie-solvro",
    startDate: "2025-08-01T00:00:00.000Z",
    endDate: "2025-10-14T11:59:59.000Z",
    firstFormId: 1,
    location: "Wrocław",
    primaryColor: "#3458ae",
    organizer: "KN Solvro",
    participantsCount: 0,
    contactEmail: null,
    socialMediaLinks: null,
    createdAt: "",
    updatedAt: "",
    photoUrl: "/assets/landing/event-list/wakacyjne-wyzwanie.png",
    firstForm: null,
  },
  {
    id: 1,
    organizerId: 1,
    name: "Dni Zero 2025 – Od skrzata do studenta",
    description:
      "Ahhh… Jak dobrze Was widzieć! ☺️ Przyszliście tu poczytać, czym są te całe „Dni Zero”? Otóż, po pierwsze, poznacie kolegów i koleżanki, z którymi będziecie studiować. Po drugie, jako starsze rodzeństwo oprowadzimy Was po najlepszych zakątkach Wrocławia. Dalej - poopowiadamy Wam o studiowaniu, a na koniec razem udamy się na imprezę! A że mamy we Wrocławiu rzekę, to impreza na pewno będzie miała z nią coś wspólnego. 😏 ZAPISY ZAMKNIĘTE! 👋",
    slug: "dni-zero-2025",
    startDate: "2025-09-24T00:00:00.000Z",
    endDate: "2025-09-25T11:59:59.000Z",
    firstFormId: 1,
    location: "Wrocław",
    primaryColor: "#3458ae",
    organizer: "Samorząd Studencki Politechniki Wrocławskiej",
    participantsCount: 0,
    contactEmail: null,
    socialMediaLinks: null,
    createdAt: "",
    updatedAt: "",
    photoUrl: "/assets/landing/event-list/dni-zero.png",
    firstForm: null,
  },
];

function Events({ selectedMonth }: { selectedMonth: number }) {
  // Filter events based on selected month
  const filteredEvents = events.filter((event) => {
    const eventStartMonth = new Date(event.startDate).getUTCMonth();
    const eventEndMonth = new Date(event.endDate).getUTCMonth();

    // Show event if it starts, ends, or spans through the selected month
    return (
      eventStartMonth === selectedMonth ||
      eventEndMonth === selectedMonth ||
      (eventStartMonth < selectedMonth && eventEndMonth > selectedMonth)
    );
  });

  return (
    <section id="events" className="flex flex-col">
      <div className="border-input z-10 flex w-full flex-col divide-y-[1px] border-b bg-white dark:bg-[#101011]">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
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

export function EventList() {
  // Move the month state up to EventList so it can be shared between Timeline and Events
  const [month, setMonth] = useState<number>(new Date().getMonth());

  return (
    <div className="w-full overflow-hidden">
      <Timeline month={month} setMonth={setMonth} />
      <Events selectedMonth={month} />
    </div>
  );
}
