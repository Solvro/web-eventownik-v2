"use server";

import type { NewEventEmailTemplate } from "@/atoms/new-email-template-atom";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";

async function createEventEmailTemplate(
  eventId: string,
  emailTemplate: NewEventEmailTemplate,
) {
  const session = await verifySession();
  if (session == null) {
    return {
      success: false,
      error: "Brak autoryzacji",
    };
  }

  const response = await fetch(`${API_URL}/events/${eventId}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailTemplate),
  });

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[createEventEmailTemplate action] Failed to create event email template for event ${eventId}:`,
      error,
    );
    return {
      success: false,
      error: `Błąd ${response.status.toString()} ${response.statusText}`,
    };
  }

  return {
    success: true,
    error: null,
  };
}

export { createEventEmailTemplate };
