"use server";

import { redirect } from "next/navigation";

import type { EventDetailsKey } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import { isValidUuid } from "@/lib/is-valid-uuid";
import { verifySession } from "@/lib/session";
import type {
  CreateTicketPayload,
  GetTicketParticipantsResponse,
  Ticket,
} from "@/types/tickets";

export async function getTickets(eventUuid: string) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid)) {
    return null;
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/tickets`,
    {
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    console.error(
      `[getTickets action] Failed to fetch tickets for event ${eventUuid}:`,
      await response.text(),
    );
    return null;
  }

  return (await response.json()) as Ticket[];
}

export async function getTicket(eventUuid: string, ticketUuid: string) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid) || !isValidUuid(ticketUuid)) {
    return null;
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/tickets/${encodeURIComponent(ticketUuid)}`,
    {
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    console.error(
      `[getTicket action] Failed to fetch ticket ${ticketUuid} for event ${eventUuid}:`,
      await response.text(),
    );
    return null;
  }

  return (await response.json()) as Ticket;
}

export async function createTicket(
  eventUuid: string,
  payload: CreateTicketPayload,
) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  if (
    !isValidUuid(eventUuid) ||
    (payload.mode === "BLOCK" && !isValidUuid(payload.attributeUuid)) ||
    payload.shownAttributeUuids?.some((uuid) => !isValidUuid(uuid)) === true
  ) {
    return {
      success: false,
      error: { key: "invalidIdentifier" as EventDetailsKey },
    };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/tickets`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[createTicket action] Failed to create a ticket for event ${eventUuid}:`,
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

  return { success: true, ticket: (await response.json()) as Ticket };
}

/** Replaces the whole list of shown attributes, so always pass the full array */
export async function updateTicketShownAttributes(
  eventUuid: string,
  ticketUuid: string,
  shownAttributeUuids: string[],
) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  if (
    !isValidUuid(eventUuid) ||
    !isValidUuid(ticketUuid) ||
    shownAttributeUuids.some((uuid) => !isValidUuid(uuid))
  ) {
    return {
      success: false,
      error: { key: "invalidIdentifier" as EventDetailsKey },
    };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/tickets/${encodeURIComponent(ticketUuid)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shownAttributeUuids }),
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[updateTicketShownAttributes action] Failed to update ticket ${ticketUuid} for event ${eventUuid}:`,
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

  return { success: true, ticket: (await response.json()) as Ticket };
}

/** Also deletes all check-ins for the ticket */
export async function deleteTicket(eventUuid: string, ticketUuid: string) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid) || !isValidUuid(ticketUuid)) {
    return {
      success: false,
      error: { key: "invalidIdentifier" as EventDetailsKey },
    };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/tickets/${encodeURIComponent(ticketUuid)}`,
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
      `[deleteTicket action] Failed to delete ticket ${ticketUuid} for event ${eventUuid}:`,
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

/** blockUuid is required for BLOCK tickets and not allowed for EVENT tickets */
export async function getTicketParticipants(
  eventUuid: string,
  ticketUuid: string,
  query: {
    page: number;
    take: number;
    blockUuid?: string;
    confirmed?: boolean;
    search?: string;
  },
) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  if (
    !isValidUuid(eventUuid) ||
    !isValidUuid(ticketUuid) ||
    (query.blockUuid !== undefined && !isValidUuid(query.blockUuid))
  ) {
    return null;
  }

  const searchParameters = new URLSearchParams({
    page: query.page.toString(),
    take: query.take.toString(),
  });
  if (query.blockUuid !== undefined) {
    searchParameters.set("blockUuid", query.blockUuid);
  }
  if (query.confirmed !== undefined) {
    searchParameters.set("confirmed", query.confirmed.toString());
  }
  if (query.search !== undefined && query.search !== "") {
    searchParameters.set("search", query.search);
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/tickets/${encodeURIComponent(ticketUuid)}/participants?${searchParameters.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    console.error(
      `[getTicketParticipants action] Failed to fetch participants of ticket ${ticketUuid} for event ${eventUuid}:`,
      await response.text(),
    );
    return null;
  }

  return (await response.json()) as GetTicketParticipantsResponse;
}
