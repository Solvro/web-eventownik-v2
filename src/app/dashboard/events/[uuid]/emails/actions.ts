"use server";

import { redirect } from "next/navigation";

import type { EventDetailsKey } from "@/i18n/translate-or-fallback";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { UpdateEventEmailPayload } from "@/types/emails";

import { getSingleEventEmail } from "./data-access";

export async function getSingleEventEmailAction(
  eventUuid: string,
  emailUuid: string,
) {
  return await getSingleEventEmail(eventUuid, emailUuid);
}

export async function createEventEmail(data: {
  eventUuid: string;
  emailTemplate: UpdateEventEmailPayload;
}) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(`${API_URL}/events/${data.eventUuid}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data.emailTemplate),
  });

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[createEventEmail action] Failed to create event email template for event ${data.eventUuid}:`,
      error,
    );
    return {
      success: false,
      error: {
        key: "httpError" as EventDetailsKey,
        values: {
          status: response.status,
          statusText: response.statusText,
        },
      },
    };
  }

  return {
    success: true,
    error: null,
  };
}

export async function updateEventEmail(data: {
  eventUuid: string;
  mailUuid: string | null;
  emailTemplate: UpdateEventEmailPayload;
}) {
  if (data.mailUuid == null) {
    return {
      success: false,
      error: { key: "invalidEmailUuid" as EventDetailsKey },
    };
  }

  const session = await verifySession();

  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${data.eventUuid}/emails/${data.mailUuid}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data.emailTemplate),
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[updateEventEmail action] Failed to update event email ${data.mailUuid} for event ${data.eventUuid}:`,
      error,
    );
    return {
      success: false,
      error: {
        key: "httpError" as EventDetailsKey,
        values: {
          status: response.status,
          statusText: response.statusText,
        },
      },
    };
  }

  return { error: null, success: true };
}

export async function reorderEmails(eventUuid: string, orderedIds: string[]) {
  const session = await verifySession();

  if (session == null) {
    return {
      success: false,
      error: { key: "unauthorized" as EventDetailsKey },
    };
  }

  //TODO: as soon as backend exposes an endpoint for reordering block attributes, replace this with a single request
  const results = await Promise.all(
    orderedIds.map(async (id, index) =>
      fetch(`${API_URL}/events/${eventUuid}/emails/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.bearerToken}`,
        },
        body: JSON.stringify({ order: index }),
      }),
    ),
  );

  const failed = results.find((r) => !r.ok);
  if (failed !== undefined) {
    console.error(
      `[reorderEmails action] Failed to reorder emails for event ${eventUuid}`,
    );
    return {
      success: false,
      error: {
        key: "httpError" as EventDetailsKey,
        values: {
          status: failed.status,
          statusText: failed.statusText,
        },
      },
    };
  }

  return { success: true };
}

export async function deleteEventMail(eventUuid: string, mailUuid: string) {
  const session = await verifySession();

  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${eventUuid}/emails/${mailUuid}`,
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
      `[deleteEventMail action] Failed to delete event mail ${mailUuid} for event ${eventUuid}:`,
      error,
    );
    return {
      success: false,
      error: {
        key: "httpError" as EventDetailsKey,
        values: {
          status: response.status,
          statusText: response.statusText,
        },
      },
    };
  }

  return { success: true };
}
