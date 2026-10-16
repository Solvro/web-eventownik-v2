import { addYears, format, startOfMonth } from "date-fns";
import type { MetadataRoute } from "next";

import { API_URL } from "@/lib/api";
import { getReferenceCollection } from "@/lib/backend";
import type { V3Event } from "@/types/v3";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://eventownik.solvro.pl";

async function fetchPublicEvents(): Promise<V3Event[]> {
  const now = new Date();
  const from = format(startOfMonth(now), "yyyy-MM-dd");
  const to = format(addYears(now, 1), "yyyy-MM-dd");

  try {
    return await getReferenceCollection<V3Event>(
      `${API_URL}/public/events?after=${from}&before=${to}`,
      { next: { revalidate: 3600 } },
    );
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
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...eventRoutes];
}
