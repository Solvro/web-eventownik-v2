import "server-only";

import { API_URL } from "./api";
import { isValidUuid } from "./is-valid-uuid";
import { verifySession } from "./session";

export async function reorderBackendPage(
  eventUuid: string,
  collection: "forms" | "emails",
  orderedIds: string[],
  originalIds: string[],
  offset: number,
) {
  const session = await verifySession();
  if (
    session === null ||
    !isValidUuid(eventUuid) ||
    [...orderedIds, ...originalIds].some((id) => !isValidUuid(id))
  ) {
    return { success: false };
  }
  const response = await fetch(
    `${API_URL}/events/${eventUuid}/${collection}/reorder`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.bearerToken}`,
      },
      body: JSON.stringify({ orderedIds, originalIds, offset }),
    },
  );
  return { success: response.ok };
}
