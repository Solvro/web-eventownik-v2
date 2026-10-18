export const API_URL = process.env.NEXT_PUBLIC_EVENTOWNIK_API ?? "";
export const PHOTO_URL = process.env.NEXT_PUBLIC_PHOTO_URL ?? "";

if (API_URL === "") {
  throw new Error(
    "NEXT_PUBLIC_EVENTOWNIK_API was not set in enviroment variables!",
  );
}

export interface PaginatedResponse<T> {
  meta: {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: T[];
}

export function photoUrl(value: string | null): string {
  if (value === null || value === "") {
    return "";
  }
  return /^(https?:|data:|blob:)/u.test(value)
    ? value
    : `${PHOTO_URL}/${value}`;
}
