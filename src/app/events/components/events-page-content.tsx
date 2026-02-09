"use client";

import type { QueryFunctionContext } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { addMonths, format } from "date-fns";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { startTransition, useState } from "react";

import { API_URL } from "@/lib/api";
import type { EventCategory } from "@/types/categories";
import type { Event } from "@/types/event";

import { MOCK_EVENTS } from "../mock-events";
import { CategoryFilter } from "./category-filter";
import { EventCard } from "./event-card";

function getEventsUrl() {
  const now = new Date();
  const sixMonthsLater = addMonths(now, 6);

  const formattedStart = format(now, "yyyy-MM-dd");
  const formattedEnd = format(sixMonthsLater, "yyyy-MM-dd");

  return `${API_URL}/events/public?from=${formattedStart}&to=${formattedEnd}`;
}

function filterMockEventsNext6Months(): Event[] {
  const now = new Date();
  const sixMonthsLater = addMonths(now, 6);

  return MOCK_EVENTS.filter((event) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);

    return eventEnd >= now && eventStart <= sixMonthsLater;
  });
}

async function fetchEvents(
  _context: QueryFunctionContext<[string]>,
): Promise<Event[]> {
  const url = getEventsUrl();

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        return filterMockEventsNext6Months();
      }
      throw new Error("Failed to fetch events");
    }
    const events = (await response.json()) as Event[];

    if (events.length === 0 && process.env.NODE_ENV === "development") {
      return filterMockEventsNext6Months();
    }

    return events;
  } catch {
    if (process.env.NODE_ENV === "development") {
      return filterMockEventsNext6Months();
    }
    throw new Error("Failed to fetch events");
  }
}

export function EventsPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | "all"
  >("all");

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-events-next-6-months"],
    queryFn: fetchEvents,
  });

  const filteredEvents =
    events?.filter((event) => {
      if (selectedCategory === "all") {
        return true;
      }
      return event.categories.includes(selectedCategory);
    }) ?? [];

  const sortedEvents = filteredEvents.toSorted((a, b) => {
    const aStart = new Date(a.startDate);
    const bStart = new Date(b.startDate);
    return aStart.getTime() - bStart.getTime();
  });

  const handleCategoryChange = (category: EventCategory | "all") => {
    startTransition(() => {
      setSelectedCategory(category);
    });
  };

  return (
    <div className="flex w-full flex-col gap-12 py-8">
      <header className="container mx-auto px-4 text-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Przeglądaj wydarzenia
          </h1>
        </div>
      </header>

      <section className="container mx-auto px-4">
        <div className="mx-auto">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </section>

      <main className="container mx-auto px-4 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/60 px-8 py-6 backdrop-blur-sm dark:bg-white/10">
              <Loader2Icon className="text-primary size-8 animate-spin" />
              <p className="font-medium">Pobieranie wydarzeń...</p>
            </div>
          </div>
        ) : error === null && sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/60 px-8 py-8 backdrop-blur-sm dark:bg-white/10">
              <CalendarIcon className="size-16 opacity-50" />
              <p className="text-xl font-medium">Brak nadchodzących wydarzeń</p>
              {selectedCategory === "all" ? null : (
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Pokaż wszystkie kategorie
                </button>
              )}
            </div>
          </div>
        ) : error === null ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-destructive flex flex-col items-center gap-4 rounded-2xl bg-white/60 px-8 py-6 backdrop-blur-sm dark:bg-white/10">
              <p className="font-medium">Nie udało się pobrać wydarzeń</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
