"use server";

import type { EventDetailsKey } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import { reorderBackendPage } from "@/lib/reorder";
import { verifySession } from "@/lib/session";
import type { FormAttributeBase } from "@/types/attributes";
import type { CompleteEventForm } from "@/types/forms";

export type Payload = Omit<
  CompleteEventForm,
  | "eventUuid"
  | "uuid"
  | "slug"
  | "attributes"
  | "order"
  | "createdAt"
  | "updatedAt"
> & {
  attributes: FormAttributeBase[];
};

/** Payload with open/close already resolved to ISO instants in the browser (see `withResolvedFormDates`). */
export type ResolvedPayload = Omit<
  Payload,
  "openDate" | "openTime" | "closeDate" | "closeTime"
> & {
  openDate: string | null;
  closeDate: string | null;
};

export async function reorderForms(
  eventUuid: string,
  orderedIds: string[],
  originalIds: string[],
  offset: number,
) {
  return reorderBackendPage(
    eventUuid,
    "forms",
    orderedIds,
    originalIds,
    offset,
  );
}

export async function createEventForm(
  eventUuid: string,
  form: ResolvedPayload,
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
    body: JSON.stringify({
      name: form.name,
      description: form.description,
      openDate: form.openDate,
      attributes: form.attributes.map(({ uuid, isRequired, order }) => ({
        attributeUuid: uuid,
        isRequired,
        order: order ?? 0,
      })),
      isEditable: form.attributes.some((attribute) => attribute.isEditable),
      closeDate: form.closeDate,
      isOpen: form.isOpen,
      isFirstForm: form.isFirstForm,
      openCondition: form.openCondition,
    }),
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
  form: ResolvedPayload,
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
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        openDate: form.openDate,
        attributes: form.attributes.map(({ uuid, isRequired, order }) => ({
          attributeUuid: uuid,
          isRequired,
          order: order ?? 0,
        })),
        isEditable: form.attributes.some((attribute) => attribute.isEditable),
        closeDate: form.closeDate,
        isFirstForm: form.isFirstForm,
        isOpen: form.isOpen,
        openCondition: form.openCondition,
      }),
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
