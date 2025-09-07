"use client";

import { format } from "date-fns";
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  ArrowUpRight,
  CircleChevronDown,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

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

function Timeline() {
  // Get the current month number to set the right active month
  const [month, setMonth] = useState<number>(new Date().getMonth());
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
        <ArrowLeftCircle
          size={36}
          className="z-10"
          onClick={() => {
            setMonth((previous) => Math.max(previous - 1, 0));
          }}
        />
        <ArrowRightCircle
          size={36}
          className="z-10"
          onClick={() => {
            setMonth((previous) => Math.min(previous + 1, 11));
          }}
        />
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
  title,
  organizer,
  description,
  date,
  imageSource,
  imageAlt,
}: {
  title: string;
  organizer: string;
  description: string;
  date: Date;
  imageSource: string;
  imageAlt: string;
}) {
  const dateParts = format(date, "dd.MM.yyyy").split(".");
  return (
    <div
      className={cn(
        "group flex w-full justify-center bg-white px-4 py-8 text-black transition hover:bg-[#b7cdff] lg:px-8",
      )}
    >
      <div className="divide-input container flex flex-col gap-12 lg:flex-row lg:gap-16">
        {/* Desktop view only */}
        <div className="hidden w-1/3 flex-col items-center gap-4 lg:flex">
          <p className="text-center text-5xl font-extrabold text-[#274276]">
            {`${dateParts[0]}.${dateParts[1]}`}
            <br />
            {dateParts[2]}
          </p>
          <p className="rounded-full bg-[#88FC61] px-5 py-2 text-center font-extrabold text-[#5E941C]">
            Dostępna rejestracja
          </p>
        </div>
        {/* Mobile view only */}
        <div className="relative lg:hidden">
          <Image
            src={imageSource}
            alt={imageAlt}
            className="block aspect-video w-full rounded-4xl object-cover shadow-lg lg:hidden"
            width={1280}
            height={720}
          />
          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-start justify-between rounded-4xl bg-gradient-to-r from-black/60 to-transparent p-6 text-white">
            <p className="rounded-full bg-[#88FC61] px-5 py-2 text-center text-sm font-extrabold text-[#5E941C] sm:text-base">
              Dostępna rejestracja
            </p>
            <p className="text-left text-4xl font-semibold sm:text-5xl">
              {`${dateParts[0]}.${dateParts[1]}`}
              <br />
              {dateParts[2]}
            </p>
          </div>
        </div>
        {/* Changes for mobile view */}
        <div className="flex w-full flex-row gap-16">
          <div className="w-full min-w-2/3 space-y-12">
            <div className="space-y-6">
              <p className="text-4xl font-semibold">{title}</p>
              <p className="text-sm font-medium">{organizer}</p>
              <p className="text-2xl">{description}</p>
            </div>
            <Button
              asChild
              variant={"secondary"}
              className="border-input/20 flex w-full items-center justify-center rounded-full border bg-[#d6d6d6] text-black group-hover:bg-[#4473E1] group-hover:text-white group-hover:hover:bg-[#3458ae] lg:w-min"
            >
              <Link href="/">
                Sprawdź
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
          {/* Desktop view only */}
          <Image
            src={imageSource}
            alt={imageAlt}
            className="hidden aspect-video w-xl rounded-4xl object-cover shadow-lg lg:block"
            width={1280}
            height={720}
          />
        </div>
      </div>
    </div>
  );
}

function Events() {
  return (
    <section className="flex flex-col">
      <div className="border-input z-10 flex w-full flex-col divide-y-[1px] border-b">
        <Event
          title="Tytuł wydarzenia"
          organizer="Organizator"
          description="Opis wydarzenia"
          date={new Date("2025-08-05")}
          imageSource={"/event-photo-placeholder.png"}
          imageAlt={"Event placeholder"}
        />
        <Event
          title="Tytuł wydarzenia"
          organizer="Organizator"
          description="Opis wydarzenia"
          date={new Date("2025-08-03")}
          imageSource={"/event-photo-placeholder.png"}
          imageAlt={"Event placeholder"}
        />
        <Event
          title="Tytuł wydarzenia"
          organizer="Organizator"
          description="Opis wydarzenia"
          date={new Date("2025-08-01")}
          imageSource={"/event-photo-placeholder.png"}
          imageAlt={"Event placeholder"}
        />
      </div>
      <div className="clip-curve flex w-full flex-col items-center justify-center bg-white p-4">
        <Button
          variant={"outline"}
          className="rounded-full border-black bg-transparent text-black hover:bg-[#d6d6d6]/50 hover:text-black"
        >
          <CircleChevronDown />
          Pokaż więcej
        </Button>
      </div>
    </section>
  );
}

export function EventList() {
  return (
    <div className="w-full overflow-hidden">
      <Timeline />
      <Events />
    </div>
  );
}
