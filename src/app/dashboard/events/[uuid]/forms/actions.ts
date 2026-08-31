"use server";

import type { EventDetailsKey } from "@/i18n/translate-or-fallback";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { CreateEventFormDto } from "@/types/forms";

export async function createEventForm(
  eventUuid: string,
  payload: CreateEventFormDto,
) {
  const session = await verifySession();

  if (session == null) {
    return {
      success: false,
      error: { key: "unauthorized" as EventDetailsKey },
    };
  }

  const response = await fetch(`${API_URL}/events/${eventUuid}/forms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.bearerToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as {
      message: string | undefined;
      errors: [{ message: string }] | undefined;
    };
    console.error(
      `[createEventForm action] Failed to create event form for event ${eventUuid}:`,
      error,
    );
    const errorMessages = [
      error.message,
      ...(error.errors?.map((error_) => error_.message) ?? []),
    ]
      .filter(Boolean)
      .join("\n");

    return {
      success: false,
      error: errorMessages
        ? {
            message: errorMessages,
          }
        : {
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

export async function updateEventForm(
  eventUuid: string,
  formUuid: string,
  payload: Partial<CreateEventFormDto>,
) {
  const session = await verifySession();

  if (session == null) {
    return {
      success: false,
      error: { key: "unauthorized" },
    };
  }

  const response = await fetch(
    `${API_URL}/events/${eventUuid}/forms/${formUuid}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.bearerToken}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as {
      message: string | undefined;
      errors: [{ message: string }] | undefined;
    };
    console.error(
      `[updateEventForm action] Failed to update event form ${formUuid} for event ${eventUuid}:`,
      error,
    );
    const errorMessages = [
      error.message,
      ...(error.errors?.map((error_) => error_.message) ?? []),
    ]
      .filter(Boolean)
      .join("\n");

    return {
      success: false,
      error: errorMessages
        ? {
            message: errorMessages,
          }
        : {
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

export async function reorderForms(eventUuid: string, orderedIds: string[]) {
  const session = await verifySession();

  if (session == null) {
    return { success: false, error: { key: "unauthorized" } };
  }

  //TODO: as soon as backend exposes an endpoint for reordering block attributes, replace this with a single request
  const results = await Promise.all(
    orderedIds.map(async (id, index) =>
      fetch(`${API_URL}/events/${eventUuid}/forms/${id}`, {
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
      `[reorderForms action] Failed to reorder forms for event ${eventUuid}`,
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

export async function deleteEventForm(eventUuid: string, formUuid: string) {
  const session = await verifySession();

  if (session == null) {
    return {
      success: false,
      error: { key: "unauthorized" as EventDetailsKey },
    };
  }

  const response = await fetch(
    `${API_URL}/events/${eventUuid}/forms/${formUuid}`,
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
      `[deleteEventForm action] Failed to delete event form ${formUuid} for event ${eventUuid}:`,
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
