"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import type { EventDetailsKey } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import { getNextCopyName } from "@/lib/utils";
import type { UpdateEventEmailPayload } from "@/types/emails";

import { getEmailDeliveries } from "./data-access";

export async function getEmailDeliveriesAction(
  eventUuid: string,
  emailUuid: string,
) {
  return await getEmailDeliveries(eventUuid, emailUuid);
}

/**
 * The backend replaces message tags only in empty spans with nothing but `data-id`, while
 * the editor renders them with a label and styling. See `setupSuggestions` for parsing them back.
 *
 * TODO(v3): Remove once the backend parser accepts the editor's spans
 */
function normalizeMessageTags(content: string) {
  return content.replaceAll(
    /<span\b[^>]*\bdata-id="(\/(?:participant|form|event)_[\w-]+)"[^>]*>[\s\S]*?<\/span>/g,
    '<span data-id="$1"></span>',
  );
}

/**
 * Builds the request body for creating or updating a template.
 * `trigger` and `triggerConfig` are always sent together, since the backend
 * clears the config of a template updated without it.
 */
function getEmailTemplateBody(template: UpdateEventEmailPayload) {
  return {
    name: template.name,
    content: normalizeMessageTags(template.content),
    trigger: template.trigger,
    triggerConfig:
      template.trigger === "FORM_FILLED"
        ? { formUuid: template.triggerValue }
        : {},
    // Simple templates have no schema, and the backend expects an object, not a JSON string
    ...(template.schema != null && {
      schema: JSON.parse(template.schema) as unknown,
    }),
  };
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
    body: JSON.stringify(getEmailTemplateBody(data.emailTemplate)),
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
      body: JSON.stringify(getEmailTemplateBody(data.emailTemplate)),
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

export async function duplicateEventEmail(
  eventUuid: string,
  mailUuid: string,
  sourceName: string,
) {
  const session = await verifySession();

  if (session == null) {
    return { success: false };
  }

  const existingResponse = await fetch(
    `${API_URL}/events/${eventUuid}/emails?take=100`,
    { headers: { Authorization: `Bearer ${session.bearerToken}` } },
  );
  if (!existingResponse.ok) {
    console.warn(
      `[duplicateEventEmail action] Failed to fetch existing email names for event ${eventUuid}, the copy number may repeat:`,
      await existingResponse.text(),
    );
  }
  const existing = existingResponse.ok
    ? ((await existingResponse.json()) as { data: { name: string }[] }).data
    : [];

  const newName = getNextCopyName(
    sourceName,
    existing.map((item) => item.name),
    (await getLocale()) === "en",
  );

  const response = await fetch(
    `${API_URL}/events/${eventUuid}/emails/${mailUuid}/duplicate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.bearerToken}`,
      },
      body: JSON.stringify({ name: newName }),
    },
  );

  if (!response.ok) {
    console.error(
      `[duplicateEventEmail action] Failed to duplicate email ${mailUuid} for event ${eventUuid}:`,
      await response.text(),
    );
    return { success: false };
  }

  return { success: true };
}
