import { cache } from "react";
import "server-only";

import { API_URL } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/api";
import {
  getBackend,
  getReferenceCollection,
  paginatedUrl,
} from "@/lib/backend";
import { verifySession } from "@/lib/session";
import type {
  V3Attribute,
  V3Email,
  V3EmailSummary,
  V3Event,
  V3FormSummary,
} from "@/types/v3";

export async function getEventEmails(eventUuid: string, page = 1, take = 20) {
  const session = await verifySession();
  if (session === null) {
    return null;
  }
  try {
    return await getBackend<PaginatedResponse<V3EmailSummary>>(
      paginatedUrl(`${API_URL}/events/${eventUuid}/emails`, page, take),
      { headers: { Authorization: `Bearer ${session.bearerToken}` } },
    );
  } catch {
    return null;
  }
}
export const getSingleEventEmail = cache(
  async (eventUuid: string, emailUuid: string) => {
    const session = await verifySession();
    if (session === null) {
      return null;
    }
    try {
      return await getBackend<V3Email>(
        `${API_URL}/events/${eventUuid}/emails/${emailUuid}`,
        { headers: { Authorization: `Bearer ${session.bearerToken}` } },
      );
    } catch {
      return null;
    }
  },
);
export async function getEventAttributes(eventUuid: string) {
  const session = await verifySession();
  if (session === null) {
    return [];
  }
  return getReferenceCollection<V3Attribute>(
    `${API_URL}/events/${eventUuid}/attributes`,
    { headers: { Authorization: `Bearer ${session.bearerToken}` } },
  );
}
export async function getEventForms(eventUuid: string) {
  const session = await verifySession();
  if (session === null) {
    return [];
  }
  return getReferenceCollection<V3FormSummary>(
    `${API_URL}/events/${eventUuid}/forms`,
    { headers: { Authorization: `Bearer ${session.bearerToken}` } },
  );
}
export const getEmailEventInfo = cache(async (eventUuid: string) => {
  const session = await verifySession();
  if (session === null) {
    return null;
  }
  try {
    return await getBackend<V3Event>(`${API_URL}/events/${eventUuid}`, {
      headers: { Authorization: `Bearer ${session.bearerToken}` },
    });
  } catch {
    return null;
  }
});
