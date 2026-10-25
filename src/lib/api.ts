import type { PaginationMeta } from "@/types/common";

export const API_URL = process.env.NEXT_PUBLIC_EVENTOWNIK_API ?? "";

if (API_URL === "") {
  throw new Error(
    "NEXT_PUBLIC_EVENTOWNIK_API was not set in enviroment variables!",
  );
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta;
  data: T[];
}

const MAX_PAGE_SIZE = 100;

/**
 * Fetches every page of a paginated list endpoint and returns all items.
 * The backend returns at most 100 items per page, with 10 as the default.
 *
 * @param url - List endpoint URL, may already contain other query params
 * @param init - Fetch options shared by every page request, e.g. auth headers
 * @returns All items, or `null` if any page request failed
 */
export async function fetchAllPages<T>(
  url: string,
  init?: RequestInit,
): Promise<T[] | null> {
  const pageUrl = new URL(url);
  pageUrl.searchParams.set("take", String(MAX_PAGE_SIZE));

  const items: T[] = [];
  for (let page = 1; ; page++) {
    pageUrl.searchParams.set("page", String(page));
    const response = await fetch(pageUrl, init);
    if (!response.ok) {
      console.error(
        `[fetchAllPages] Failed to fetch ${pageUrl.toString()}`,
        response.status,
      );
      return null;
    }

    const { data, meta } = (await response.json()) as PaginatedResponse<T>;
    items.push(...data);
    if (!meta.hasNextPage) {
      return items;
    }
  }
}
