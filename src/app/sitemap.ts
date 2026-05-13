import { addYears, format, startOfMonth } from "date-fns";
import type { MetadataRoute } from "next";

import { API_URL } from "@/lib/api";
import type { Event } from "@/types/event";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://eventownik.solvro.pl";

async function fetchPublicEvents(): Promise<Event[]> {
  const now = new Date();
  const from = format(startOfMonth(now), "yyyy-MM-dd");
  const to = format(addYears(now, 1), "yyyy-MM-dd");

  try {
    const response = await fetch(
      `${API_URL}/events/public?from=${from}&to=${to}`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) {
      return [];
    }
    return (await response.json()) as Event[];
  } catch {
    return [];
  }
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
  ];

  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${BASE_URL}/${event.slug}`,
    lastModified: new Date(event.startDate),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...eventRoutes];
}
