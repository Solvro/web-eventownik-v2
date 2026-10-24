import { API_URL } from "@/lib/api";
import type { Block } from "@/types/blocks";

export async function getEventBlockAttributeBlocks(
  eventSlug: string,
  attributeUuid: string,
) {
  const blocksResponse = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}/attributes/${encodeURIComponent(attributeUuid)}/blocks`,
    {
      method: "GET",
    },
  );

  if (!blocksResponse.ok) {
    const error = (await blocksResponse.json()) as unknown;
    console.error(error);
    return null;
  }

  return (await blocksResponse.json()) as Block;
}
