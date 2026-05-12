import {
  addMonths,
  format,
  getMonth,
  getYear,
  set,
  startOfMonth,
} from "date-fns";
import type { MetadataRoute } from "next";

import { API_URL } from "@/lib/api";
import type { Event } from "@/types/event";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://eventownik.solvro.pl";

function getEventsUrl(year: number, month: number) {
  const targetDate = set(new Date(), { year, month });
  const startDate = startOfMonth(targetDate);
  const endDate = addMonths(startDate, 1);
  return `${API_URL}/events/public?from=${format(startDate, "yyyy-MM-dd")}&to=${format(endDate, "yyyy-MM-dd")}`;
}

async function fetchPublicEvents(): Promise<Event[]> {
  const now = new Date();

  const monthsToFetch: { year: number; month: number }[] = [];
  for (let offset = -6; offset <= 12; offset++) {
    const date = addMonths(now, offset);
    monthsToFetch.push({ year: getYear(date), month: getMonth(date) });
  }

  const results = await Promise.allSettled(
    monthsToFetch.map(async ({ year, month }) => {
      const response = await fetch(getEventsUrl(year, month), {
        next: { revalidate: 3600 },
      });
      if (!response.ok) {
        return [];
      }
      return (await response.json()) as Event[];
    }),
  );

  const seen = new Set<number>();
  const events: Event[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") {
      continue;
    }
    for (const event of result.value) {
      if (!seen.has(event.id)) {
        seen.add(event.id);
        events.push(event);
      }
    }
  }

  return events;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await fetchPublicEvents();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${BASE_URL}/${event.slug}`,
    // event.startDate bo event.updatedAt jest undefined, jakis backend skill issue
    lastModified: new Date(event.startDate),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...eventRoutes];
}
