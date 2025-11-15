"use client";

import type { QueryFunctionContext } from "@tanstack/react-query";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  addMonths,
  eachYearOfInterval,
  format,
  getMonth,
  getYear,
  set,
  startOfMonth,
} from "date-fns";
import { CircleAlert, Loader2 } from "lucide-react";
import { useState } from "react";

import { EventList } from "@/app/(homepage)/sections/events/event-list";
import { Timeline } from "@/app/(homepage)/sections/events/timeline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/lib/api";
import type { Event as EventType } from "@/types/event";

/**
 * Generates an API URL for a specific month and year.
 *
 * @param {number} year - The full year.
 * @param {number} month - The month (1 for Jan, 12 for Dec).
 * @returns {string} The formatted API URL string.
 */
function getEventsUrl(year: number, month: number) {
  const targetDate = set(new Date(), { year, month });

  // Get the first and last day of the month
  const startDate = startOfMonth(targetDate);
  const endDate = addMonths(startDate, 1);

  // Format them into YYYY-MM-DD strings
  const formattedStart = format(startDate, "yyyy-MM-dd");
  const formattedEnd = format(endDate, "yyyy-MM-dd");

  // 4. Build the URL
  return `${API_URL}/events/public?from=${formattedStart}&to=${formattedEnd}`;
}

async function fetchEvents(
  context: QueryFunctionContext<[string, number, number]>,
): Promise<EventType[]> {
  const [_key, year, month] = context.queryKey;
  const url = getEventsUrl(year, month);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json() as Promise<EventType[]>;
}

export function Events() {
  const [filters, setFilters] = useState<{ month: number; year: number }>({
    month: getMonth(new Date()),
    year: getYear(new Date()),
  });

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    // TODO: implement selecting year later
    queryKey: ["events", filters.year, filters.month],
    queryFn: fetchEvents,
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <div className="flex flex-row items-center gap-2 rounded-2xl bg-white px-6 py-4 shadow-xl">
        <Loader2 className="animate-spin" />
        Pobieranie wydarzeń...
      </div>
    );
  }

  if (error != null) {
    return (
      <div className="flex flex-row items-center gap-2 rounded-2xl bg-white px-6 py-4 shadow-xl">
        <CircleAlert className="text-red-500" />
        <p>O nie! Nie udało się pobrać wydarzeń: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div>
        <Select
          value={filters.year.toString()}
          onValueChange={(value) => {
            setFilters({ year: Number(value), month: filters.month });
          }}
        >
          <SelectTrigger className="h-auto gap-1 rounded-full px-4 py-2">
            <SelectValue placeholder={filters.year} className="rounded-full" />
          </SelectTrigger>
          <SelectContent>
            {eachYearOfInterval({
              start: new Date(2025, 0, 1),
              end: new Date(getYear(new Date()) + 1, 0, 1),
            })
              .toReversed()
              .map((date) => {
                const year = getYear(date);
                return (
                  <SelectItem key={year.toString()} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full overflow-hidden">
        <Timeline filters={filters} setFilters={setFilters} />
        <EventList events={events} />
      </div>
    </div>
  );
}
