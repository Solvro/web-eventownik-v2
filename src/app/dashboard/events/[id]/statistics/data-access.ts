"use server";

import { redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { EventAttribute } from "@/types/attributes";
import type { Participant } from "@/types/participant";

export async function getOrderedEventAttributes(
  eventId: string,
): Promise<EventAttribute[]> {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(`${API_URL}/events/${eventId}/attributes`, {
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch attributes for event ${eventId} (status ${response.status.toString()})`,
    );
  }

  const attributes = (await response.json()) as EventAttribute[];
  attributes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return attributes;
}

/**
 * Fetches participants for computing attribute statistics client-side.
 *
 * The participants `index` endpoint only preloads attributes with
 * `showInList === true`, so we pass the selected attribute's slug via
 * `bonus_attributes` to make sure its values are always included, even when the
 * attribute is hidden from the participants list.
 */
export async function getParticipantsForStats(
  eventId: string,
  attributeSlug: string | null,
): Promise<Participant[]> {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  const url = new URL(`${API_URL}/events/${eventId}/participants`);
  if (attributeSlug != null && attributeSlug !== "") {
    url.searchParams.set("bonus_attributes", attributeSlug);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch participants for event ${eventId} (status ${response.status.toString()})`,
    );
  }

  return (await response.json()) as Participant[];
}
