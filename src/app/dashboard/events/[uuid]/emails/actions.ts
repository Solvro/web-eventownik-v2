"use server";

import { redirect } from "next/navigation";

import type { EventDetailsKey } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/api";
import { attributeValue, emailPayload } from "@/lib/api-v3";
import { getBackend, paginatedUrl } from "@/lib/backend";
import { reorderBackendPage } from "@/lib/reorder";
import { verifySession } from "@/lib/session";
import type { UpdateEventEmailPayload } from "@/types/emails";
import type { V3Attribute, V3Email, V3EmailDelivery } from "@/types/v3";

export async function getEmailHistoryAction(
  eventUuid: string,
  emailUuid: string,
  page = 1,
  take = 20,
  query: {
    email?: string;
    status?: V3EmailDelivery["status"][];
    sort?: string;
  } = {},
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }
  const url = paginatedUrl(
    `${API_URL}/events/${eventUuid}/emails/${emailUuid}/participants`,
    page,
    take,
  );
  if (query.email !== undefined && query.email.trim() !== "") {
    url.searchParams.set("email", query.email);
  }
  if (query.sort !== undefined) {
    url.searchParams.set("sort", query.sort);
  }
  for (const status of query.status ?? []) {
    url.searchParams.append("status", status);
  }
  return getBackend<PaginatedResponse<V3EmailDelivery>>(url, {
    headers: { Authorization: `Bearer ${session.bearerToken}` },
  });
}

async function prepareEmailPayload(
  eventUuid: string,
  template: UpdateEventEmailPayload,
  bearerToken: string,
  emailUuid?: string,
) {
  const payload = emailPayload(template);
  if (
    template.trigger !== "attribute_changed" ||
    template.triggerValue === null
  ) {
    return payload;
  }
  const headers = { Authorization: `Bearer ${bearerToken}` };
  if (emailUuid !== undefined) {
    const previous = await getBackend<V3Email>(
      `${API_URL}/events/${eventUuid}/emails/${emailUuid}`,
      { headers },
    );
    const value = previous.triggerConfig?.expectedValue;
    const text =
      typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
    if (
      previous.triggerConfig?.attributeUuid === template.triggerValue &&
      text === (template.triggerValue2 ?? "")
    ) {
      return {
        ...payload,
        triggerConfig: {
          attributeUuid: template.triggerValue,
          ...(value === undefined ? {} : { expectedValue: value }),
        },
      };
    }
  }
  const attribute = await getBackend<V3Attribute>(
    `${API_URL}/events/${eventUuid}/attributes/${template.triggerValue}`,
    { headers },
  );
  return {
    ...payload,
    triggerConfig: {
      attributeUuid: attribute.uuid,
      expectedValue: attributeValue(attribute.type, template.triggerValue2),
    },
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
    body: JSON.stringify(
      await prepareEmailPayload(
        data.eventUuid,
        data.emailTemplate,
        session.bearerToken,
      ),
    ),
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
      body: JSON.stringify(
        await prepareEmailPayload(
          data.eventUuid,
          data.emailTemplate,
          session.bearerToken,
          data.mailUuid,
        ),
      ),
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

export async function reorderEmails(
  eventUuid: string,
  orderedIds: string[],
  originalIds: string[],
  offset: number,
) {
  return reorderBackendPage(
    eventUuid,
    "emails",
    orderedIds,
    originalIds,
    offset,
  );
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
