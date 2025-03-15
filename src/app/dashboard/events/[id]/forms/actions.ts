"use server";

import { formatISO9075 } from "date-fns";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { EventForm } from "@/types/forms";

type Payload = Omit<EventForm, "eventId" | "id" | "slug">;

export async function createEventForm(eventId: string, form: Payload) {
  const session = await verifySession();

  if (session == null) {
    return {
      success: false,
      error: "Brak autoryzacji",
    };
  }

  const response = await fetch(`${API_URL}/events/${eventId}/forms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.bearerToken}`,
    },
    body: JSON.stringify({
      name: form.name,
      description: form.description,
      startDate: formatISO9075(form.startDate),
      attributes: form.attributes,
      endDate: formatISO9075(form.endDate),
      isOpen: form.isOpen,
      isFirstForm: form.isFirstForm,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[createEventForm action] Failed to create event form for event ${eventId}:`,
      error,
    );
    return {
      success: false,
      error: `Błąd ${response.status.toString()} ${response.statusText}`,
    };
  }

  return { success: true };
}

export async function updateEventForm(
  eventId: string,
  formId: string,
  form: Payload,
) {
  const session = await verifySession();

  if (session == null) {
    return {
      success: false,
      error: "Brak autoryzacji",
    };
  }

  const response = await fetch(`${API_URL}/events/${eventId}/forms/${formId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.bearerToken}`,
    },
    body: JSON.stringify({
      name: form.name,
      description: form.description,
      startDate: formatISO9075(form.startDate),
      attributesIds: form.attributes.map((attribute) => attribute.id),
      endDate: formatISO9075(form.endDate),
      isOpen: form.isOpen,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[updateEventForm action] Failed to update event form ${formId} for event ${eventId}:`,
      error,
    );
    return {
      success: false,
      error: `Błąd ${response.status.toString()} ${response.statusText}`,
    };
  }

  return { success: true };
}

export async function deleteEventForm(eventId: string, formId: string) {
  const session = await verifySession();

  if (session == null) {
    return {
      success: false,
      error: "Brak autoryzacji",
    };
  }

  const response = await fetch(`${API_URL}/events/${eventId}/forms/${formId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[deleteEventForm action] Failed to delete event form ${formId} for event ${eventId}:`,
      error,
    );
    return {
      success: false,
      error: `Błąd ${response.status.toString()} ${response.statusText}`,
    };
  }

  return { success: true };
}
