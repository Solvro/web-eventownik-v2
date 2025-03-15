import { cache } from "react";

import { API_URL } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { EventAttribute } from "@/types/attributes";
import type { EventForm } from "@/types/forms";

async function getEventAttributes(eventId: string) {
  const session = await verifySession();
  if (session == null) {
    return [];
  }

  const response = await fetch(`${API_URL}/events/${eventId}/attributes`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
    },
  });

  if (!response.ok) {
    console.error(
      `[getEventAttributes] Failed to fetch available attributes when attempting to create a new form for event ${eventId}:`,
      response,
    );
    return [];
  }

  const attributes = (await response.json()) as EventAttribute[];

  return attributes;
}

async function getEventForms(eventId: string) {
  const session = await verifySession();
  if (session == null) {
    return [];
  }

  const response = await fetch(`${API_URL}/events/${eventId}/forms`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
    },
  });

  if (!response.ok) {
    console.error(
      `[getEventForms] Failed to fetch forms for event ${eventId}:`,
      response,
    );
    return [];
  }

  const parsed = (await response.json()) as PaginatedResponse<EventForm>;
  return parsed.data;
}

const getSingleEventForm = cache(async (eventId: string, formId: string) => {
  const session = await verifySession();
  if (session == null) {
    return null;
  }

  const response = await fetch(`${API_URL}/events/${eventId}/forms/${formId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
    },
  });

  if (!response.ok) {
    console.error(
      `[getSingleEventForm] Failed to fetch form ${formId} for event ${eventId}:`,
      response,
    );
    return null;
  }

  const parsed = (await response.json()) as EventForm;
  return parsed;
});

export { getEventAttributes, getEventForms, getSingleEventForm };
