export const API_URL = process.env.EVENTOWNIK_API ?? "";
export const PHOTO_URL = process.env.NEXT_PUBLIC_PHOTO_URL ?? "";

if (API_URL === "") {
  throw new Error("EVENTOWNIK_API was not set in enviroment variables!");
}

if (PHOTO_URL === "") {
  throw new Error("PHOTO_URL was not set in enviroment variables!");
}

export interface PaginatedResponse<T> {
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
  };
  data: T[];
}
