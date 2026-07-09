"use server";

import type { useTranslations } from "next-intl";
import { redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { UpdateEventEmailPayload } from "@/types/emails";

import { getSingleEventEmail } from "./data-access";

export async function getSingleEventEmailAction(
  eventId: string,
  emailId: string,
) {
  return await getSingleEventEmail(eventId, emailId);
}

export async function createEventEmail(
  data: {
    eventId: string;
    emailTemplate: UpdateEventEmailPayload;
  },
  t: ReturnType<typeof useTranslations<"EventDetails">>,
) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(`${API_URL}/events/${data.eventId}/emails`, {
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
      `[createEventEmail action] Failed to create event email template for event ${data.eventId}:`,
      error,
    );
    return {
      success: false,
      error: t("httpError", {
        status: response.status,
        statusText: response.statusText,
      }),
    };
  }

  return {
    success: true,
    error: null,
  };
}

export async function updateEventEmail(
  data: {
    eventId: string;
    mailId: string | null;
    emailTemplate: UpdateEventEmailPayload;
  },
  t: ReturnType<typeof useTranslations<"EventDetails">>,
) {
  if (data.mailId == null) {
    return { success: false, error: t("invalidEmailId") };
  }

  const session = await verifySession();

  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${data.eventId}/emails/${data.mailId}`,
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
      `[updateEventEmail action] Failed to update event email ${data.mailId} for event ${data.eventId}:`,
      error,
    );
    return {
      success: false,
      error: t("httpError", {
        status: response.status,
        statusText: response.statusText,
      }),
    };
  }

  return { error: null, success: true };
}

export async function reorderEmails(
  eventId: string,
  orderedIds: number[],
  t: ReturnType<typeof useTranslations<"EventDetails">>,
) {
  const session = await verifySession();

  if (session == null) {
    return { success: false, error: t("unauthorized") };
  }

  //TODO: as soon as backend exposes an endpoint for reordering block attributes, replace this with a single request
  const results = await Promise.all(
    orderedIds.map(async (id, index) =>
      fetch(`${API_URL}/events/${eventId}/emails/${id.toString()}`, {
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
      `[reorderEmails action] Failed to reorder emails for event ${eventId}`,
    );
    return {
      success: false,
      error: t("httpError", {
        status: failed.status,
        statusText: failed.statusText,
      }),
    };
  }

  return { success: true };
}

export async function deleteEventMail(
  eventId: string,
  mailId: string,
  t: ReturnType<typeof useTranslations<"EventDetails">>,
) {
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
      error: t("httpError", {
        status: response.status,
        statusText: response.statusText,
      }),
    };
  }

  return { success: true };
}
