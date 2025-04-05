import { API_URL } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { EventAttribute } from "@/types/attributes";
import type { EventEmail, SingleEventEmail } from "@/types/emails";
import type { EventForm } from "@/types/forms";

export async function getEventEmails(eventId: string) {
  const session = await verifySession();
  if (session == null) {
    return null;
  }

  const response = await fetch(`${API_URL}/events/${eventId}/emails`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
    },
  });

  if (!response.ok) {
    console.error(
      `[getEventEmails] Failed to fetch available emails for event ${eventId}:`,
      response,
    );
    return null;
  }

  const emails = (await response.json()) as EventEmail[];

  return emails;
}

export async function getSingleEventEmail(eventId: string, emailId: string) {
  const session = await verifySession();
  if (session == null) {
    return null;
  }

  const response = await fetch(
    `${API_URL}/events/${eventId}/emails/${emailId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    console.error(
      `[getSingleEventEmail] Failed to fetch email ${emailId} for event ${eventId}:`,
      response,
    );
    return null;
  }

  const email = (await response.json()) as SingleEventEmail;
  return email;
}

export async function getEventAttributes(eventId: string) {
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
      `[getEventAttributes] Failed to fetch available attributes when attempting to create a new email for event ${eventId}:`,
      response,
    );
    return [];
  }

  const attributes = (await response.json()) as EventAttribute[];

  return attributes;
}

export async function getEventForms(eventId: string) {
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
