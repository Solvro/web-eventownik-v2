import "server-only";

import { API_URL, fetchAllPages } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type {
  EventEmail,
  EventEmailParticipantData,
  SingleEventEmail,
} from "@/types/emails";
import type { Event } from "@/types/event";
import type { EventForm } from "@/types/forms";

import { getTickets } from "../tickets/actions";

export async function getEventEmails(eventUuid: string) {
  const session = await verifySession();
  if (session == null) {
    return null;
  }

  const emails = await fetchAllPages<EventEmail>(
    `${API_URL}/events/${eventUuid}/emails?sort=order:asc`,
    {
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (emails === null) {
    console.error(
      `[getEventEmails] Failed to fetch available emails for event ${eventUuid}`,
    );
  }

  return emails;
}

export async function getSingleEventEmail(
  eventUuid: string,
  emailUuid: string,
) {
  const session = await verifySession();
  if (session == null) {
    return null;
  }

  const response = await fetch(
    `${API_URL}/events/${eventUuid}/emails/${emailUuid}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    console.error(
      `[getSingleEventEmail] Failed to fetch email ${emailUuid} for event ${eventUuid}:`,
      response,
    );
    return null;
  }

  const email = (await response.json()) as SingleEventEmail;
  return email;
}

export async function getEventAttributes(eventUuid: string) {
  const session = await verifySession();
  if (session == null) {
    return [];
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
      `[getEventAttributes] Failed to fetch available attributes when attempting to create a new email for event ${eventUuid}`,
    );
    return [];
  }

  return attributes;
}

export async function getEventForms(eventUuid: string) {
  const session = await verifySession();
  if (session == null) {
    return [];
  }

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

export async function getEventTickets(eventUuid: string) {
  const tickets = await getTickets(eventUuid);

  if (tickets === null) {
    console.error(
      `[getEventTickets] Failed to fetch tickets for event ${eventUuid}`,
    );
    return [];
  }

  return tickets;
}

export async function getEmailDeliveries(eventUuid: string, emailUuid: string) {
  const session = await verifySession();
  if (session == null) {
    return null;
  }

  const deliveries = await fetchAllPages<EventEmailParticipantData>(
    `${API_URL}/events/${eventUuid}/emails/${emailUuid}/participants`,
    {
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (deliveries === null) {
    console.error(
      `[getEmailDeliveries] Failed to fetch deliveries of email ${emailUuid} for event ${eventUuid}`,
    );
  }

  return deliveries;
}

export async function getEmailEventInfo(eventUuid: string) {
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
      `[getEmailEventInfo] Failed to fetch event info for event ${eventUuid}:`,
      response,
    );
    return null;
  }

  const event = (await response.json()) as Event;
  return event;
}
