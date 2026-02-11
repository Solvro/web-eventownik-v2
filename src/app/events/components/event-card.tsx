import { differenceInCalendarDays, format } from "date-fns";
import { pl } from "date-fns/locale";
import { ArrowUpRightIcon, CalendarIcon, MapPinIcon } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition, useState } from "react";

import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types/categories";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
}

function getEventStatus(startDate: Date, endDate: Date) {
  const now = new Date();

  if (now < startDate) {
    const daysLeft = differenceInCalendarDays(startDate, now);

    if (daysLeft === 0) {
      return {
        status: "Dzisiaj",
        className:
          "bg-[#FF4D4D] text-white dark:bg-[#FF4D4D]/90 dark:text-white shadow-sm",
      };
    }

    if (daysLeft === 1) {
      return {
        status: "Jutro",
        className:
          "bg-[#FF9F1C] text-white dark:bg-[#FF9F1C]/90 dark:text-white shadow-sm",
      };
    }

    if (daysLeft <= 3) {
      return {
        status: `Za ${daysLeft.toString()} dni`,
        className:
          "bg-[#FF4D4D] text-white dark:bg-[#FF4D4D]/90 dark:text-white shadow-sm",
      };
    }

    if (daysLeft <= 7) {
      return {
        status: `Za ${daysLeft.toString()} dni`,
        className:
          "bg-[#FFB703] text-black dark:bg-[#FFB703]/90 dark:text-black shadow-sm",
      };
    }

    return {
      status: `Za ${daysLeft.toString()} dni`,
      className:
        "bg-[#2D6A4F] text-white dark:bg-[#2D6A4F]/90 dark:text-white shadow-sm",
    };
  } else if (now >= startDate && now <= endDate) {
    return {
      status: "W trakcie",
      className:
        "bg-[#4473E1] text-white dark:bg-[#4473E1]/90 dark:text-white shadow-sm",
    };
  } else {
    return {
      status: "Zakończone",
      className:
        "bg-gray-400 text-white dark:bg-gray-600 dark:text-gray-200 shadow-sm",
    };
  }
}

function formatEventDate(startDate: Date, endDate: Date) {
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  if (isSameDay) {
    return format(startDate, "d MMMM yyyy", { locale: pl });
  }

  return `${format(startDate, "d MMM", { locale: pl })} - ${format(endDate, "d MMM yyyy", { locale: pl })}`;
}

export function EventCard({ event }: EventCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const status = getEventStatus(startDate, endDate);

  const eventPhoto = event.photoUrl;

  const handleFlip = () => {
    if (!isAnimating) {
      setIsFlipped(!isFlipped);
      setIsAnimating(true);
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  return (
    <ViewTransition name={`event-${event.id.toString()}`}>
      <div
        className="group relative h-full w-full cursor-pointer perspective-[1000px]"
        onClick={handleFlip}
        onKeyDown={(keyboardEvent) => {
          if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
            keyboardEvent.preventDefault();
            handleFlip();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={handleAnimationComplete}
          style={{ transformStyle: "preserve-3d" }}
          className="relative h-full w-full"
        >
          <div
            className="h-full w-full overflow-hidden rounded-3xl bg-white shadow-lg dark:bg-[#1a1a2e]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex h-full flex-col">
              <div className="relative aspect-video shrink-0 overflow-hidden">
                <Image
                  src={
                    eventPhoto ??
                    "https://picsum.photos/seed/event-placeholder/800/450"
                  }
                  alt={event.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-bold",
                      status.className,
                    )}
                  >
                    {status.status}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                  {event.categories.slice(0, 3).map((category) => (
                    <span
                      key={category}
                      className="rounded-full px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm"
                      style={{
                        backgroundColor: CATEGORY_COLORS[category].bg,
                        color: CATEGORY_COLORS[category].text,
                      }}
                    >
                      {CATEGORY_LABELS[category]}
                    </span>
                  ))}
                  {event.categories.length > 3 && (
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      +{event.categories.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="space-y-2">
                  <h3 className="line-clamp-2 text-lg leading-tight font-semibold text-gray-900 transition-colors group-hover:text-[#4473E1] dark:text-white dark:group-hover:text-[#7294e2]">
                    {event.name}
                  </h3>
                  {event.organizer !== null && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {event.organizer}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-4 shrink-0" />
                    <span>{formatEventDate(startDate, endDate)}</span>
                  </div>
                  {event.location !== null && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="size-4 shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>

                <div
                  className="mt-auto flex w-full flex-row gap-2"
                  onClick={(mouseEvent) => {
                    mouseEvent.stopPropagation();
                  }}
                  onKeyDown={(keyboardEvent) => {
                    keyboardEvent.stopPropagation();
                  }}
                  role="presentation"
                >
                  <Button
                    asChild
                    className="w-full rounded-full bg-[#d6d6d6] text-black transition-colors hover:bg-[#4473E1] hover:text-white dark:bg-[#2a2a45] dark:text-white dark:hover:bg-[#4473E1]"
                  >
                    <Link href={`/${event.slug}`}>
                      Sprawdź
                      <ArrowUpRightIcon />
                    </Link>
                  </Button>
                  <ShareButton
                    path={event.slug}
                    variant="icon"
                    buttonVariant="default"
                    className="aspect-square w-fit rounded-full bg-[#d6d6d6] pl-3.5 text-black transition-colors hover:bg-[#4473E1] hover:text-white dark:bg-[#2a2a45] dark:text-white dark:hover:bg-[#4473E1]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute top-0 left-0 h-full w-full overflow-hidden rounded-3xl bg-white shadow-lg dark:bg-[#1a1a2e]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex h-full flex-col p-6">
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                {event.name}
              </h3>
              <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 flex-1 overflow-y-auto pr-2">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                  {event.description ?? "Brak opisu wydarzenia."}
                </p>
              </div>

              <div
                className="mt-6 flex w-full flex-row gap-2 border-t border-gray-100 pt-4 dark:border-gray-800"
                onClick={(mouseEvent) => {
                  mouseEvent.stopPropagation();
                }}
                onKeyDown={(keyboardEvent) => {
                  keyboardEvent.stopPropagation();
                }}
                role="presentation"
              >
                <Button
                  asChild
                  className="w-full rounded-full bg-[#d6d6d6] text-black transition-colors hover:bg-[#4473E1] hover:text-white dark:bg-[#2a2a45] dark:text-white dark:hover:bg-[#4473E1]"
                >
                  <Link href={`/${event.slug}`}>
                    Sprawdź
                    <ArrowUpRightIcon />
                  </Link>
                </Button>
                <ShareButton
                  path={event.slug}
                  variant="icon"
                  buttonVariant="default"
                  className="aspect-square w-fit rounded-full bg-[#d6d6d6] pl-3.5 text-black transition-colors hover:bg-[#4473E1] hover:text-white dark:bg-[#2a2a45] dark:text-white dark:hover:bg-[#4473E1]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </ViewTransition>
  );
}
