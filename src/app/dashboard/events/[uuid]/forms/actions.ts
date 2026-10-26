"use server";

import { getLocale } from "next-intl/server";

import type { EventDetailsKey } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import { COPY_SUFFIX_REGEX, getNextCopyName } from "@/lib/utils";
import type { Event } from "@/types/event";
import type { CreateEventFormDto } from "@/types/forms";

/**
 * Form with its open and close date-times already resolved to ISO strings.
 * They have to be resolved in the browser, since a server action would apply the server's timezone
 */
export type EventFormPayload = Omit<
  CreateEventFormDto,
  "openDate" | "closeDate" | "openTime" | "closeTime"
> & {
  openDate: string | null;
  closeDate: string | null;
};

async function setIsFirstForm(
  eventUuid: string,
  formUuid: string,
  isFirstForm: boolean,
  bearerToken: string,
) {
  return fetch(`${API_URL}/events/${eventUuid}/forms/${formUuid}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({ isFirstForm }),
  });
}

/**
 * The backend rejects a new registration form while the event has a different one, so the current
 * one has to be unset first. Returns its UUID, so it can be restored if saving the new one fails.
 *
 * TODO(v3): Replace with a single request once the backend can swap registration forms
 */
async function unsetOtherRegistrationForm(
  eventUuid: string,
  formUuid: string | null,
  bearerToken: string,
) {
  const eventResponse = await fetch(`${API_URL}/events/${eventUuid}`, {
    headers: { Authorization: `Bearer ${bearerToken}` },
  });
  if (!eventResponse.ok) {
    return null;
  }

  const { registerFormUuid } = (await eventResponse.json()) as Event;
  if (registerFormUuid === null || registerFormUuid === formUuid) {
    return null;
  }

  const response = await setIsFirstForm(
    eventUuid,
    registerFormUuid,
    false,
    bearerToken,
  );
  if (!response.ok) {
    console.error(
      `[unsetOtherRegistrationForm] Failed to unset registration form ${registerFormUuid} for event ${eventUuid}:`,
      await response.text(),
    );
    return null;
  }

  return registerFormUuid;
}

export async function createEventForm(
  eventUuid: string,
  form: EventFormPayload,
) {
  const session = await verifySession();

  if (session == null) {
    return {
      success: false,
      error: { key: "unauthorized" as EventDetailsKey },
    };
  }

  const previousRegistrationFormUuid =
    form.isFirstForm === true
      ? await unsetOtherRegistrationForm(eventUuid, null, session.bearerToken)
      : null;

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
      closeDate: form.closeDate,
      attributes: form.attributes,
      isFirstForm: form.isFirstForm,
      isOpen: form.isOpen,
      openCondition: form.openCondition,
    }),
  });

  if (!response.ok) {
    if (previousRegistrationFormUuid !== null) {
      await setIsFirstForm(
        eventUuid,
        previousRegistrationFormUuid,
        true,
        session.bearerToken,
      );
    }

    const error = (await response.json()) as {
      message?: string | string[];
    };
    console.error(
      `[createEventForm action] Failed to create event form for event ${eventUuid}:`,
      error,
    );
    const errorMessages = [error.message ?? []]
      .flat()
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
  form: Partial<EventFormPayload>,
) {
  const session = await verifySession();

  if (session == null) {
    return {
      success: false,
      error: { key: "unauthorized" },
    };
  }

  const previousRegistrationFormUuid =
    form.isFirstForm === true
      ? await unsetOtherRegistrationForm(
          eventUuid,
          formUuid,
          session.bearerToken,
        )
      : null;

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
        closeDate: form.closeDate,
        attributes: form.attributes,
        isFirstForm: form.isFirstForm,
        isOpen: form.isOpen,
        openCondition: form.openCondition,
      }),
    },
  );

  if (!response.ok) {
    if (previousRegistrationFormUuid !== null) {
      await setIsFirstForm(
        eventUuid,
        previousRegistrationFormUuid,
        true,
        session.bearerToken,
      );
    }

    const error = (await response.json()) as {
      message?: string | string[];
    };
    console.error(
      `[updateEventForm action] Failed to update event form ${formUuid} for event ${eventUuid}:`,
      error,
    );
    const errorMessages = [error.message ?? []]
      .flat()
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

export async function duplicateEventForm(
  eventUuid: string,
  formUuid: string,
  sourceName: string,
) {
  const session = await verifySession();

  if (session == null) {
    return { success: false };
  }

  const existingResponse = await fetch(
    `${API_URL}/events/${eventUuid}/forms?name=${encodeURIComponent(sourceName.replace(COPY_SUFFIX_REGEX, ""))}&take=100`,
    { headers: { Authorization: `Bearer ${session.bearerToken}` } },
  );
  if (!existingResponse.ok) {
    console.warn(
      `[duplicateEventForm action] Failed to fetch existing form names for event ${eventUuid}, the copy number may repeat:`,
      await existingResponse.text(),
    );
  }
  const existing = existingResponse.ok
    ? (
        (await existingResponse.json()) as {
          data: { name: string }[];
        }
      ).data
    : [];
  const newName = getNextCopyName(
    sourceName,
    existing.map((item) => item.name),
    (await getLocale()) === "en",
  );

  const response = await fetch(
    `${API_URL}/events/${eventUuid}/forms/${formUuid}/duplicate`,
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
      `[duplicateEventForm action] Failed to duplicate form ${formUuid} for event ${eventUuid}:`,
      await response.text(),
    );
    return { success: false };
  }

  return { success: true };
}
