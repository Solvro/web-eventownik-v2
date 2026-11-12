import { cache } from "react";

import { API_URL, fetchAllPages } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type { Event } from "@/types/event";
import type { EventForm } from "@/types/forms";

async function getEventAttributes(eventUuid: string) {
  const session = await verifySession();
  if (session == null) {
    return null;
  }

  const attributes = await fetchAllPages<Attribute>(
    `${API_URL}/events/${eventUuid}/attributes?sort=order:asc`,
    {
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (attributes === null) {
    console.error(
      `[getEventAttributes] Failed to fetch available attributes when attempting to create a new form for event ${eventUuid}`,
    );
  }

  return attributes;
}

async function getEvent(eventUuid: string) {
  const session = await verifySession();
  if (session == null) {
    return null;
  }

  const response = await fetch(`${API_URL}/events/${eventUuid}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
    },
  });

  if (!response.ok) {
    console.error(
      `[getEvent] Failed to fetch event ${eventUuid} when editing a form:`,
      response,
    );
    return null;
  }

  return (await response.json()) as Event;
}

async function getEventForms(eventUuid: string) {
  const session = await verifySession();
  if (session == null) {
    return [];
  }

  // `createdAt` breaks ties, e.g. a duplicated form gets the same order as the original
  const forms = await fetchAllPages<EventForm>(
    `${API_URL}/events/${eventUuid}/forms?sort=order:asc,createdAt:asc`,
    {
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (forms === null) {
    console.error(
      `[getEventForms] Failed to fetch forms for event ${eventUuid}`,
    );
    return [];
  }

  return forms;
}

const getSingleEventForm = cache(
  async (eventUuid: string, formUuid: string) => {
    const session = await verifySession();
    if (session == null) {
      return null;
    }

    const response = await fetch(
      `${API_URL}/events/${eventUuid}/forms/${formUuid}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.bearerToken}`,
        },
      },
    );

    if (!response.ok) {
      console.error(
        `[getSingleEventForm] Failed to fetch form ${formUuid} for event ${eventUuid}:`,
        response,
      );
      return null;
    }

    const parsed = (await response.json()) as EventForm;
    return parsed;
  },
);

export { getEvent, getEventAttributes, getEventForms, getSingleEventForm };
