import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { EventEmail, SingleEventEmail } from "@/types/emails";

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
