"use client";

import type { QueryFunctionContext } from "@tanstack/react-query";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
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
import { useTranslations } from "next-intl";
import { useState } from "react";

import { EventList } from "@/app/(homepage)/sections/events/event-list";
import { Timeline } from "@/app/(homepage)/sections/events/timeline";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaginatedResponse } from "@/lib/api";
import { API_URL } from "@/lib/api";
import { getBackend, paginatedUrl } from "@/lib/backend";
import type { V3Event } from "@/types/v3";

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
  return `${API_URL}/public/events?after=${formattedStart}&before=${formattedEnd}`;
}

async function fetchEvents(
  context: QueryFunctionContext<readonly [string, number, number], number>,
): Promise<PaginatedResponse<V3Event>> {
  const [_key, year, month] = context.queryKey;
  const url = paginatedUrl(getEventsUrl(year, month), context.pageParam);
  url.searchParams.set("sort", "startDate:asc");
  return getBackend<PaginatedResponse<V3Event>>(url);
}

export function Events() {
  const t = useTranslations("Homepage");

  const [filters, setFilters] = useState<{ month: number; year: number }>({
    month: getMonth(new Date()),
    year: getYear(new Date()),
  });

  const {
    data: eventPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    // TODO: implement selecting year later
    queryKey: ["events", filters.year, filters.month] as const,
    queryFn: fetchEvents,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <div className="flex flex-row items-center gap-2 rounded-2xl bg-white px-6 py-4 text-black shadow-xl">
        <Loader2 className="animate-spin" />
        {t("loadingEvents")}
      </div>
    );
  }

  if (error != null) {
    return (
      <div className="flex flex-row items-center gap-2 rounded-2xl bg-white px-6 py-4 text-black shadow-xl">
        <CircleAlert className="text-red-500" />
        <p>{t("failedToLoadEvents", { message: error.message })}</p>
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
        <EventList
          events={eventPages?.pages.flatMap((result) => result.data)}
        />
        {hasNextPage ? (
          <div className="flex justify-center py-4">
            <Button
              onClick={() => {
                void fetchNextPage();
              }}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? t("loadingEvents") : t("loadMoreEvents")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
