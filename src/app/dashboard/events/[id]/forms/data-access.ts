import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { EventForm } from "@/types/forms";

interface EventAttribute {
  id: number;
  name: string;
}

async function getEventFormAttributes(eventId: string) {
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
      `[getEventFormAttributes] Failed to fetch available attributes when attempting to create a new form for event ${eventId}:`,
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

  const forms = (await response.json()) as EventForm[];
  return forms;
}

export { getEventFormAttributes, getEventForms };
