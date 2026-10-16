import type { PaginatedResponse } from "./api";

export class BackendError extends Error {
  constructor(readonly status: number) {
    super(`Backend request failed (${String(status)})`);
  }
}

/** One request, returning the v3 body unchanged. Callers own pagination and related-data queries. */
export async function getBackend<T>(
  url: string | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new BackendError(response.status);
  }
  return (await response.json()) as T;
}

export function pageNumber(value: string | string[] | undefined): number {
  const page = Number(typeof value === "string" ? value : 1);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function pageSize(value: string | string[] | undefined): number {
  const take = Number(typeof value === "string" ? value : 20);
  return Number.isSafeInteger(take) && take >= 1 && take <= 100 ? take : 20;
}

export function paginatedUrl(input: string, page: number, take = 20): URL {
  const url = new URL(input);
  url.searchParams.set("page", String(page));
  url.searchParams.set("take", String(take));
  return url;
}

/** Only for complete reference collections, such as choices in a form editor. */
export async function getReferenceCollection<T>(
  input: string,
  init?: RequestInit,
): Promise<T[]> {
  const url = paginatedUrl(input, 1, 100);
  const rows: T[] = [];
  for (let page = 1; ; page++) {
    url.searchParams.set("page", String(page));
    const result = await getBackend<PaginatedResponse<T>>(url, init);
    rows.push(...result.data);
    if (!result.meta.hasNextPage) {
      return rows;
    }
  }
}
