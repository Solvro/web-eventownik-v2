import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { EventEmail } from "@/types/emails";

async function getEventEmails(eventId: string) {
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

export { getEventEmails };
