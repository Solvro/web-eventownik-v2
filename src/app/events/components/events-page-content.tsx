"use client";

import { useQuery } from "@tanstack/react-query";
import { addMonths, format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  CalendarIcon,
  Loader2Icon,
  MapPinIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import { HighlightedEventsCarousel } from "@/components/highlighted-events-carousel";
import type { EventCategory } from "@/types/categories";
import { CATEGORY_LABELS } from "@/types/categories";
import type { Event } from "@/types/event";

import { MOCK_EVENTS } from "../mock-events";
import { CategoryFilter } from "./category-filter";
import { EventCard } from "./event-card";

function filterMockEventsNext6Months(): Event[] {
  const now = new Date();
  const sixMonthsLater = addMonths(now, 6);

  return MOCK_EVENTS.filter((event) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    return eventEnd >= now && eventStart <= sixMonthsLater;
  });
}

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => {
      clearInterval(interval);
    };
  }, [targetDate]);

  return (
    <div className="flex items-center gap-6 rounded-3xl bg-white px-6 py-4 shadow-sm">
      {(
        [
          { value: timeLeft.days, label: "dni" },
          { value: timeLeft.hours, label: "godz" },
          { value: timeLeft.minutes, label: "min" },
        ] as const
      ).map(({ value, label }) => (
        <div key={label} className="flex w-[30px] flex-col items-center">
          <p className="text-2xl font-bold tracking-tight text-black">
            {String(value).padStart(2, "0")}
          </p>
          <p className="text-xs text-[#878787]">{label}</p>
        </div>
      ))}
    </div>
  );
}

function FeaturedEventSection({ events }: { events: Event[] }) {
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
              <div className="w-fit overflow-hidden rounded-2xl bg-[#3873ff] px-5 py-2.5">
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
                className="flex items-center justify-center rounded-full bg-[#3873ff] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#2d5fd4] sm:w-[180px]"
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

function HeroSection({
  onSearch,
  onCategoryQuickFilter,
}: {
  onSearch: (q: string) => void;
  onCategoryQuickFilter: (cat: EventCategory) => void;
}) {
  const [searchInput, setSearchInput] = useState("");

  const quickFilterCategories: EventCategory[] = [
    "parties",
    "trips",
    "sport",
    "cultural",
  ];

  return (
    <section className="relative w-full overflow-hidden pt-10 pb-20">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex w-full flex-col gap-8">
            <h1 className="text-foreground text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Odkryj wydarzenia
              <br />
              na{" "}
              <span className="text-[#3873ff]">
                Politechnice
                <br />
                Wrocławskiej
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-[1.3] font-medium tracking-tight text-[#191A1A] sm:text-xl dark:text-[#bbc1cf]">
              Konferencje, hackathony, warsztaty, imprezy i wiele więcej —
              wszystkie aktywności studenckiej społeczności PWr w jednym miejscu
              i od razu z możliwością zapisów!
            </p>

            <div className="flex w-full max-w-[643px] items-center justify-between rounded-3xl bg-white py-2 pr-2 pl-6 dark:bg-[#1e2a3a]">
              <div className="flex flex-1 items-center gap-2">
                <SearchIcon className="size-6 shrink-0 text-[#8a8f9d]" />
                <input
                  type="text"
                  placeholder="Szukaj wydarzenia..."
                  value={searchInput}
                  onChange={(changeEvent) => {
                    setSearchInput(changeEvent.target.value);
                  }}
                  onKeyDown={(keyboardEvent) => {
                    if (keyboardEvent.key === "Enter") {
                      onSearch(searchInput);
                    }
                  }}
                  className="min-w-0 flex-1 bg-transparent text-base font-medium tracking-tight text-[#8a8f9d] outline-none placeholder:text-[#8a8f9d] sm:text-xl dark:text-white dark:placeholder:text-[#5a6070]"
                />
              </div>
              <button
                onClick={() => {
                  onSearch(searchInput);
                }}
                className="shrink-0 rounded-2xl bg-[#3873ff] px-4 py-3 text-base font-medium tracking-tight text-white transition hover:bg-[#2d5fd4]"
              >
                Szukaj
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              {quickFilterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onCategoryQuickFilter(cat);
                  }}
                  className="border-foreground/60 text-foreground hover:bg-primary/10 rounded-full border px-5 py-2 text-base font-bold tracking-tight transition dark:hover:bg-white/10"
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            <div className="mt-14 flex flex-wrap gap-12 sm:gap-24">
              <div>
                <p className="text-foreground text-4xl font-bold">12</p>
                <p className="text-foreground/80 mt-1 text-base leading-[1.3] font-medium tracking-tight">
                  Organizacji, z którymi
                  <br />
                  współpracujemy
                </p>
              </div>
              <div>
                <p className="text-foreground text-4xl font-bold">15k+</p>
                <p className="text-foreground/80 mt-1 text-base leading-[1.3] font-medium tracking-tight">
                  Użytkowników aplikacji
                </p>
              </div>
              <div>
                <p className="text-foreground text-4xl font-bold">70k+</p>
                <p className="text-foreground/80 mt-1 text-base leading-[1.3] font-medium tracking-tight">
                  Wyświetleń wydarzeń
                </p>
              </div>
            </div>
          </div>

          {/* Right: Carousel */}
          <div className="hidden w-full shrink-2 xl:flex">
            <HighlightedEventsCarousel orientation="vertical" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="px-4 py-12 sm:px-8">
      <div className="container mx-auto">
        <div
          className="relative overflow-hidden rounded-[40px] lg:rounded-[50px]"
          style={{ minHeight: 379 }}
        >
          <Image
            src="/assets/landing/cta-bg.png"
            alt=""
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(31.4962deg, rgb(16, 16, 17) 26.21%, rgb(33, 53, 96) 125.31%, rgb(16, 16, 17) 153.45%)",
              opacity: 0.9,
            }}
          />
          <div className="absolute inset-0 shadow-[inset_400px_0px_80px_0px_rgba(8,20,34,0.71)]" />

          <div className="relative flex flex-col gap-6 p-8 lg:absolute lg:top-[64px] lg:left-[66px] lg:p-0">
            <p className="text-sm font-light tracking-widest text-white uppercase">
              Współpraca
            </p>
            <h2 className="max-w-[465px] text-3xl leading-tight font-bold tracking-tight text-white lg:text-5xl">
              Chciałbyś użyć Eventownika na swoim wydarzeniu?
            </h2>
            <a
              href="mailto:eventownik@pwr.edu.pl"
              className="w-fit rounded-[22px] border border-white px-4 py-3 text-base text-white transition hover:bg-white/10"
            >
              Skontaktuj się z nami →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EventsPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const eventsGridRef = useRef<HTMLDivElement>(null);

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-events-next-6-months"],
    queryFn: filterMockEventsNext6Months,
  });

  const filteredEvents = useMemo(() => {
    if (events === undefined) {
      return [];
    }
    return events
      .filter((event) => {
        if (
          selectedCategory !== "all" &&
          !event.categories.includes(selectedCategory)
        ) {
          return false;
        }
        if (
          searchQuery !== "" &&
          !event.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .toSorted(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
  }, [events, selectedCategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    eventsGridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCategoryQuickFilter = (cat: EventCategory) => {
    startTransition(() => {
      setSelectedCategory(cat);
    });
    eventsGridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full">
      <HeroSection
        onSearch={handleSearch}
        onCategoryQuickFilter={handleCategoryQuickFilter}
      />

      {events != null && events.length > 0 && (
        <FeaturedEventSection events={events} />
      )}

      {/* Events Grid Section */}
      <section
        ref={eventsGridRef}
        className="bg-[#f8f8f8] px-4 py-16 sm:px-8 dark:bg-[#0a0e14]"
      >
        <div className="container mx-auto">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">
                Wydarzenia na PWr
              </h2>
              <p className="mt-2 text-xl font-medium tracking-tight text-[#484848] dark:text-[#8a95a8]">
                Przeglądaj aktywności, które odbywają się na Politechnice
                Wrocławskiej
              </p>
            </div>
            <Link
              href="/events"
              className="text-xl font-bold text-[#3873ff] hover:underline dark:text-[#5a8cff]"
            >
              Zobacz wszystko
            </Link>
          </div>

          <div className="mb-10">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={(cat) => {
                startTransition(() => {
                  setSelectedCategory(cat);
                });
              }}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2Icon className="size-8 animate-spin text-[#3873ff]" />
            </div>
          ) : error == null ? (
            filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <p className="text-xl font-medium text-gray-500">
                  Brak wydarzeń w wybranej kategorii
                </p>
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                    }}
                    className="font-medium text-[#3873ff] hover:underline"
                  >
                    Pokaż wszystkie kategorie
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )
          ) : (
            <p className="py-16 text-center text-gray-500">
              Nie udało się pobrać wydarzeń
            </p>
          )}
        </div>
      </section>

      <CtaSection />
    </div>
  );
}
