"use client";

import { useQuery } from "@tanstack/react-query";
import { addMonths } from "date-fns";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { startTransition, useMemo, useRef, useState } from "react";

import type { EventCategory } from "@/types/categories";
import type { Event } from "@/types/event";

import { MOCK_EVENTS } from "../mock-events";
import { CategoryFilter } from "./category-filter";
import { CtaSection } from "./cta-section";
import { EventCard } from "./event-card";
import { FeaturedEventSection } from "./featured-event-section";
import { HeroSection } from "./hero-section";

function filterMockEventsNext6Months(): Event[] {
  const now = new Date();
  const sixMonthsLater = addMonths(now, 6);

  return MOCK_EVENTS.filter((event) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    return eventEnd >= now && eventStart <= sixMonthsLater;
  });
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

  return (
    <div className="w-full">
      <HeroSection onSearch={handleSearch} />

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
              className="text-xl font-bold text-[#3873FF] hover:underline"
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
              <Loader2Icon className="size-8 animate-spin text-[#3873FF]" />
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
                    className="font-medium text-[#3873FF] hover:underline"
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
