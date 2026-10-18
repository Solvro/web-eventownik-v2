import { cache } from "react";

import { API_URL } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/api";
import {
  getBackend,
  getReferenceCollection,
  paginatedUrl,
} from "@/lib/backend";
import { verifySession } from "@/lib/session";
import type { V3Attribute, V3Event, V3Form, V3FormSummary } from "@/types/v3";

async function getEventAttributes(eventUuid: string) {
  const session = await verifySession();
  if (session === null) {
    return [];
  }
  return getReferenceCollection<V3Attribute>(
    `${API_URL}/events/${eventUuid}/attributes`,
    { headers: { Authorization: `Bearer ${session.bearerToken}` } },
  );
}

async function getEventForms(eventUuid: string, page = 1, take = 20) {
  const session = await verifySession();
  if (session === null) {
    return null;
  }
  try {
    return await getBackend<PaginatedResponse<V3FormSummary>>(
      paginatedUrl(`${API_URL}/events/${eventUuid}/forms`, page, take),
      { headers: { Authorization: `Bearer ${session.bearerToken}` } },
    );
  } catch {
    return null;
  }
}

const getSingleEventForm = cache(
  async (eventUuid: string, formUuid: string) => {
    const session = await verifySession();
    if (session === null) {
      return null;
    }
    try {
      return await getBackend<V3Form>(
        `${API_URL}/events/${eventUuid}/forms/${formUuid}`,
        { headers: { Authorization: `Bearer ${session.bearerToken}` } },
      );
    } catch {
      return null;
    }
  },
);

async function getRegistrationFormUuid(eventUuid: string) {
  const session = await verifySession();
  if (session === null) {
    return null;
  }
  const event = await getBackend<V3Event>(`${API_URL}/events/${eventUuid}`, {
    headers: { Authorization: `Bearer ${session.bearerToken}` },
  });
  return event.registerFormUuid;
}

export {
  getEventAttributes,
  getEventForms,
  getSingleEventForm,
  getRegistrationFormUuid,
};
