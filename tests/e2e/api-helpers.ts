import type { APIRequestContext } from "@playwright/test";
import { addHours, formatISO9075 } from "date-fns";
import { randomUUID } from "node:crypto";

export const API_URL =
  process.env.NEXT_PUBLIC_EVENTOWNIK_API ?? "http://localhost:3333/api/v1";

export interface CreateEventData {
  name?: string;
  slug?: string;
  description?: string;
  location?: string;
  organizer?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface EventResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  organizer: string | null;
  startDate: string;
  endDate: string;
  primaryColor: string | null;
  contactEmail: string | null;
  participantsCount: number | null;
  photoUrl: string | null;
  socialMediaLinks: string[] | null;
  termsLink: string | null;
}

/**
 * Creates an event via the backend API
 */
export async function createEventViaApi(
  request: APIRequestContext,
  token: string,
  data: CreateEventData = {},
): Promise<EventResponse> {
  const now = new Date();
  const startDate = data.startDate ?? addHours(now, 24);
  const endDate = data.endDate ?? addHours(now, 48);

  const eventData = {
    name: data.name ?? "E2E Test Event",
    slug: data.slug ?? `e2e-${randomUUID()}`,
    description: data.description ?? "E2E test event description",
    location: data.location ?? "E2E Test Location",
    organizer: data.organizer ?? "E2E Test Organizer",
    startDate: formatISO9075(startDate, { representation: "complete" }),
    endDate: formatISO9075(endDate, { representation: "complete" }),
    primaryColor: "#3498db",
  };

  const response = await request.post(`${API_URL}/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: eventData,
  });

  if (!response.ok()) {
    const error = await response.text();
    throw new Error(`Failed to create event: ${error}`);
  }

  return (await response.json()) as EventResponse;
}

/**
 * Fetches an event by slug via the backend API
 */
export async function getEventViaApi(
  request: APIRequestContext,
  token: string,
  slug: string,
): Promise<EventResponse> {
  const response = await request.get(`${API_URL}/events/${slug}/public`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok()) {
    const error = await response.text();
    throw new Error(`Failed to fetch event: ${error}`);
  }

  return (await response.json()) as EventResponse;
}

/**
 * Deletes an event via the backend API
 */
export async function deleteEventViaApi(
  request: APIRequestContext,
  token: string,
  eventId: number,
): Promise<void> {
  const response = await request.delete(
    `${API_URL}/events/${eventId.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok()) {
    const error = await response.text();
    throw new Error(`Failed to delete event: ${error}`);
  }
}

/**
 * Checks if an event exists via the backend API
 * Returns true if the event exists, false if it returns 404
 */
export async function eventExistsViaApi(
  request: APIRequestContext,
  token: string,
  eventId: number,
): Promise<boolean> {
  const response = await request.get(
    `${API_URL}/events/${eventId.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.ok();
}
