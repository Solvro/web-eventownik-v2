import "server-only";

import { API_URL } from "@/lib/api";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";

export async function getAttribute(
  eventUuid: string,
  attributeUuid: string,
  bearerToken: string,
) {
  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes/${encodeURIComponent(attributeUuid)}`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    console.error(
      `[getAttribute] Failed to fetch attribute ${attributeUuid} for event ${eventUuid}:`,
      await response.text(),
    );
    return null;
  }

  return (await response.json()) as Attribute;
}

export async function getAttributeBlocks(
  eventUuid: string,
  attributeUuid: string,
  bearerToken: string,
) {
  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes/${encodeURIComponent(attributeUuid)}/blocks`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    console.error(
      `[getAttributeBlocks] Failed to fetch blocks of attribute ${attributeUuid} for event ${eventUuid}:`,
      await response.text(),
    );
    return [];
  }

  // The backend returns an empty array instead of the root block if the attribute has none
  const rootBlock = (await response.json()) as Block | [];
  return Array.isArray(rootBlock) ? [] : rootBlock.children;
}
