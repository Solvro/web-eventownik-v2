import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ShareButton } from "@/components/share-button";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types/categories";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.startDate);
  const firstCategory = event.categories.at(0);
  const photoSource = event.photoUrl ?? "/assets/landing/hero-card-1.png";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#e6e6e6] bg-white shadow-sm transition-shadow hover:shadow-md dark:border-[#1e2a3a] dark:bg-[#111827]">
      {/* Photo */}
      <div className="relative h-[242px] w-full shrink-0">
        <Image
          src={photoSource}
          alt={event.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Category badge - top left */}
        {firstCategory !== undefined && (
          <div
            className="absolute top-4 left-4 overflow-hidden rounded-full px-2 py-1"
            style={{
              backgroundColor: CATEGORY_COLORS[firstCategory].bg,
              color: CATEGORY_COLORS[firstCategory].text,
            }}
          >
            <p className="text-xs font-bold tracking-wide">
              {CATEGORY_LABELS[firstCategory]}
            </p>
          </div>
        )}

        {/* Participants badge - top right */}
        <div className="absolute top-4 right-4 flex items-center gap-1 overflow-hidden rounded-full bg-white px-2 py-1">
          <UsersIcon className="size-4 text-[#101010]" />
          <p className="text-xs font-bold text-[#101010]">
            {event.participantsCount}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-6 p-4">
        <div className="flex flex-col gap-4">
          <p className="text-2xl leading-[1.2] font-bold tracking-tight text-black dark:text-white">
            {event.name}
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-1 text-[#7a7a7a] dark:text-[#8a95a8]">
              <CalendarIcon className="size-4 shrink-0" />
              <span className="text-sm leading-[1.2] font-medium">
                {format(startDate, "d MMM yyyy", { locale: pl })}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#7a7a7a] dark:text-[#8a95a8]">
              <ClockIcon className="size-4 shrink-0" />
              <span className="text-sm leading-[1.2] font-medium">
                {format(startDate, "HH:mm")}
              </span>
            </div>
            {event.location != null && (
              <div className="flex items-center gap-1 text-[#7a7a7a] dark:text-[#8a95a8]">
                <MapPinIcon className="size-4 shrink-0" />
                <span className="line-clamp-1 text-sm leading-[1.2] font-medium">
                  {event.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Divider + footer */}
        <div className="mt-auto flex flex-col gap-4">
          <div className="border-t border-[#e6e6e6] dark:border-[#1e2a3a]" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-black dark:text-white">
              {event.organizer ?? ""}
            </p>
            <div className="flex items-center gap-2">
              <ShareButton
                path={event.slug}
                variant="icon"
                buttonVariant="ghost"
                className="size-8 rounded-full p-1 text-[#7a7a7a] hover:text-black dark:hover:text-white"
              />
              <Link
                href={`/${event.slug}`}
                className="text-sm font-bold text-[#3873ff] transition hover:underline"
              >
                Dołącz→
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
