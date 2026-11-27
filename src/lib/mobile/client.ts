/**
 * Browser-side client of the mobile app API. Requests go through the Next.js
 * route handler at /api/mobile/[eventSlug]/..., which attaches the participant
 * token kept in an httpOnly cookie.
 */

export class MobileApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "MobileApiError";
  }
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null && "message" in body) {
    const { message } = body;
    if (typeof message === "string") {
      return message;
    }
    if (Array.isArray(message)) {
      return message.join(", ");
    }
  }
  return fallback;
}

/**
 * Calls a participant endpoint, e.g. `mobileApi<MobileChatRoom[]>(slug, "chat/rooms")`.
 * Pass a plain object as `json` for a JSON body or a `FormData` as `body` for uploads.
 * An expired session (401) sends the participant back to the login screen.
 */
export async function mobileApi<T>(
  eventSlug: string,
  path: string,
  options: Omit<RequestInit, "body" | "headers"> & {
    json?: unknown;
    body?: FormData;
  } = {},
): Promise<T> {
  const { json, body, ...init } = options;
  const response = await fetch(
    `/api/mobile/${encodeURIComponent(eventSlug)}/${path}`,
    {
      ...init,
      headers:
        json === undefined ? undefined : { "Content-Type": "application/json" },
      body: json === undefined ? body : JSON.stringify(json),
      cache: "no-store",
    },
  );

  if (response.status === 401) {
    globalThis.location.assign(`/${encodeURIComponent(eventSlug)}/app/login`);
  }

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    throw new MobileApiError(
      response.status,
      getErrorMessage(errorBody, response.statusText),
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text === "" ? undefined : JSON.parse(text)) as T;
}

/** React Query keys, shared so screens can invalidate each other's data */
export const mobileKeys = {
  me: (eventSlug: string) => ["mobile", eventSlug, "me"] as const,
  notifications: (eventSlug: string) =>
    ["mobile", eventSlug, "notifications"] as const,
  schedule: (eventSlug: string) => ["mobile", eventSlug, "schedule"] as const,
  sos: (eventSlug: string) => ["mobile", eventSlug, "sos"] as const,
  chatRooms: (eventSlug: string) =>
    ["mobile", eventSlug, "chat", "rooms"] as const,
  chatMessages: (eventSlug: string, roomUuid: string) =>
    ["mobile", eventSlug, "chat", "rooms", roomUuid, "messages"] as const,
  tinderCandidates: (eventSlug: string) =>
    ["mobile", eventSlug, "tinder", "candidates"] as const,
  tinderMatches: (eventSlug: string) =>
    ["mobile", eventSlug, "tinder", "matches"] as const,
  bingo: (eventSlug: string) => ["mobile", eventSlug, "bingo"] as const,
  bingoLeaderboard: (eventSlug: string) =>
    ["mobile", eventSlug, "bingo", "leaderboard"] as const,
  bereal: (eventSlug: string) => ["mobile", eventSlug, "bereal"] as const,
  berealPosts: (eventSlug: string, roundUuid: string) =>
    ["mobile", eventSlug, "bereal", "rounds", roundUuid, "posts"] as const,
};
