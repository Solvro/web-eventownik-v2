"use client";

import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Event } from "@/types/event";

import { Countdown } from "./countdown";

export function FeaturedEventSection({ events }: { events: Event[] }) {
  const now = new Date();
  const featured =
    events.find((event) => new Date(event.startDate) > now) ?? events.at(0);

  if (featured === undefined) {
    return null;
  }

  const startDate = new Date(featured.startDate);
  const photoSource = featured.photoUrl ?? "/assets/landing/hero-card-1.png";

  return (
    <section className="bg-white px-4 py-16 sm:px-8 dark:bg-[#0d1520]">
      <div className="container mx-auto">
        <h2 className="mb-2 text-3xl font-bold tracking-tight text-black dark:text-white">
          Nadchodzące duże wydarzenie
        </h2>
        <p className="mb-10 text-xl font-medium text-[#484848] dark:text-[#8a95a8]">
          Nie przegap najważniejszych wydarzeń semestru
        </p>

        <div
          className="relative overflow-hidden rounded-[40px] lg:rounded-[50px]"
          style={{ minHeight: 486 }}
        >
          {/* Dark blue base */}
          <div className="absolute inset-0 bg-[#1a294a]" />

          {/* Event photo on right */}
          <div className="absolute top-0 right-0 hidden h-full w-[55%] lg:block">
            <Image
              src={photoSource}
              alt={featured.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 shadow-[inset_508px_0px_98.7px_0px_rgba(8,20,34,0.41)]" />
          </div>

          {/* Content */}
          <div className="relative flex flex-col gap-8 p-8 lg:absolute lg:top-[51px] lg:left-[58px] lg:w-[574px] lg:p-0">
            <div className="flex flex-col gap-6">
              <div className="w-fit overflow-hidden rounded-2xl bg-[#3873FF] px-5 py-2.5">
                <p className="text-xs font-bold tracking-wide text-white uppercase">
                  Polecamy
                </p>
              </div>

              <h3 className="text-3xl leading-[1.2] font-bold tracking-tight text-white lg:text-5xl">
                {featured.name}
              </h3>

              {featured.description != null && (
                <p className="line-clamp-3 text-base leading-[1.2] text-[#bbc1cf] lg:w-[515px]">
                  {featured.description}
                </p>
              )}

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="size-4 shrink-0 text-[#bbc1cf]" />
                  <span className="text-sm font-bold text-[#bbc1cf]">
                    {format(startDate, "d MMMM yyyy, HH:mm", { locale: pl })}
                  </span>
                </div>

                {featured.location != null && (
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="size-4 shrink-0 text-[#bbc1cf]" />
                    <span className="text-sm font-bold text-[#bbc1cf]">
                      {featured.location}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <UsersIcon className="size-4 shrink-0 text-[#bbc1cf]" />
                  <span className="text-sm font-bold text-[#bbc1cf]">
                    {featured.participantsCount} uczestników
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              <Link
                href={`/${featured.slug}/register`}
                className="flex items-center justify-center rounded-full bg-[#3873FF] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#2d5fd4] sm:w-[180px]"
              >
                Zarejestruj się →
              </Link>
              <Link
                href={`/${featured.slug}`}
                className="flex items-center justify-center rounded-full bg-white px-5 py-4 text-sm font-bold text-[#1a294a] transition hover:bg-gray-100 sm:w-[180px]"
              >
                Dowiedz się więcej
              </Link>
            </div>
          </div>

          {/* Countdown - top right corner of card */}
          <div className="absolute top-6 right-6">
            <Countdown targetDate={startDate} />
          </div>
        </div>
      </div>
    </section>
  );
}
