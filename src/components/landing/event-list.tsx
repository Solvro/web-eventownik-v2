import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

const images = [
  {
    src: "https://cdn.mos.cms.futurecdn.net/FgWBEA5raiBXkNQDrf9mte.jpg",
    alt: "Titans",
  },
  {
    src: "https://image.api.playstation.com/cdn/EP0006/CUSA04013_00/TGqPQusudXOvba747LKq0ANs6Cykqd43.jpg",
    alt: "Cover",
  },
  {
    src: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1237970/ss_f4a8464ce43962b76fa6f2156b341eee28ad6494.1920x1080.jpg?t=1726160226",
    alt: "Gameplay",
  },
];

function TimelineStep({
  month,
  isActive,
}: {
  month: string;
  isActive: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p
        className={cn(
          "text-4xl font-bold uppercase",
          isActive && "text-primary",
        )}
      >
        {month}
      </p>
      <div className="flex flex-row items-end gap-6">
        {Array.from({ length: 11 }).map((_, index) => (
          <span
            className={cn(
              "bg-input block",
              index === 5 ? "h-10 w-[1.5px]" : "h-5 w-px",
            )}
            key={_}
          />
        ))}
      </div>
    </div>
  );
}

function Timeline() {
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
    <div className="flex flex-row">
      {months.map((month, index) => (
        <TimelineStep key={index} month={month} isActive={index === 7} />
      ))}
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
        "group flex w-full justify-center bg-white p-6 text-black transition hover:bg-[#192339] hover:text-white lg:p-8",
      )}
    >
      <div className="divide-input container flex flex-col gap-12 lg:flex-row lg:gap-16">
        {/* Desktop view only */}
        <div className="hidden w-1/3 flex-col items-center gap-4 lg:flex">
          <p className="text-center text-5xl font-extrabold">
            {`${dateParts[0]}.${dateParts[1]}`}
            <br />
            {dateParts[2]}
          </p>
          <p className="bg-success/30 rounded-full px-5 py-2 text-center font-extrabold text-[#61a21c] hover:text-[#62a319]">
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
            <p className="bg-success rounded-full px-5 py-2 text-center text-sm font-extrabold text-[#61a21c] hover:text-[#62a319] sm:text-base">
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
              <p className="text-muted-foreground text-sm font-medium">
                {organizer}
              </p>
              <p className="text-muted-foreground text-2xl">{description}</p>
            </div>
            <Button
              asChild
              variant={"secondary"}
              className="border-input/20 flex w-min items-center justify-center rounded-full border bg-[#d6d6d6] text-black group-hover:bg-[#4473E1] group-hover:text-white group-hover:hover:bg-[#3458ae]"
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
    <div className="flex flex-col">
      <div className="border-input z-10 flex w-full flex-col divide-y-[1px] border-b">
        <Event
          title="Tytuł wydarzenia"
          organizer="Organizator"
          description="Opis wydarzenia"
          date={new Date("2025-08-05")}
          imageSource={images[0].src}
          imageAlt={images[0].alt}
        />
        <Event
          title="Tytuł wydarzenia"
          organizer="Organizator"
          description="Opis wydarzenia"
          date={new Date("2025-08-03")}
          imageSource={images[1].src}
          imageAlt={images[1].alt}
        />
        <Event
          title="Tytuł wydarzenia"
          organizer="Organizator"
          description="Opis wydarzenia"
          date={new Date("2025-08-01")}
          imageSource={images[2].src}
          imageAlt={images[2].alt}
        />
      </div>
      <div className="clip-curve flex w-full flex-col items-center justify-center bg-white p-4">
        <Button variant={"outline"} className="rounded-full">
          Pokaż więcej
        </Button>
      </div>
    </div>
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
