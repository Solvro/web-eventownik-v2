"use server";

import { redirect } from "next/navigation";

import type { EventDetailsKey } from "@/i18n/translate-or-fallback";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { UpdateEventEmailPayload } from "@/types/emails";

import { getSingleEventEmail } from "./data-access";

export async function getSingleEventEmailAction(
  eventUuid: string,
  emailId: string,
) {
  return await getSingleEventEmail(eventUuid, emailId);
}

export async function createEventEmailTemplate(data: {
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
      `[createEventEmailTemplate action] Failed to create event email template for event ${data.eventUuid}:`,
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
  mailId: string | null;
  emailTemplate: UpdateEventEmailPayload;
}) {
  const session = await verifySession();

  const { eventUuid, mailId, emailTemplate } = data;

  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${eventUuid}/emails/${mailId ?? ""}`,
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
      `[updateEventEmail action] Failed to update event email ${mailId ?? ""} for event ${eventUuid}:`,
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

export async function deleteEventMail(eventUuid: string, mailId: string) {
  const session = await verifySession();

  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${eventUuid}/emails/${mailId}`,
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
      `[deleteEventMail action] Failed to delete event mail ${mailId} for event ${eventUuid}:`,
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
