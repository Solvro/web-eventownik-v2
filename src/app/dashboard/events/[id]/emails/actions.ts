"use server";

import { redirect } from "next/navigation";

import type { NewEventEmailTemplate } from "@/atoms/new-email-template-atom";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { UpdateEventEmailPayload } from "@/types/emails";

export async function createEventEmailTemplate(
  eventId: string,
  emailTemplate: NewEventEmailTemplate,
) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
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

export async function updateEventEmail(
  eventId: string,
  mailId: string,
  updatedEmail: UpdateEventEmailPayload,
) {
  const session = await verifySession();

  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${eventId}/emails/${mailId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedEmail),
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[updateEventEmail action] Failed to update event email ${mailId} for event ${eventId}:`,
      error,
    );
    return {
      success: false,
      error: `Błąd ${response.status.toString()} ${response.statusText}`,
    };
  }

  return { success: true };
}

export async function deleteEventMail(eventId: string, mailId: string) {
  const session = await verifySession();

  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${eventId}/emails/${mailId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[deleteEventMail action] Failed to delete event mail ${mailId} for event ${eventId}:`,
      error,
    );
    return {
      success: false,
      error: `Błąd ${response.status.toString()} ${response.statusText}`,
    };
  }

  return { success: true };
}
