import { API_URL } from "@/lib/api";
import type { Block, BlockParticipant } from "@/types/blocks";

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

/**
 * Fetches the occupants of a block. The backend returns only the values of the block attribute's
 * participant fields, keyed by their index, so they're joined into a name, as v2 returned it.
 */
export async function getBlockParticipants(
  eventSlug: string,
  block: Block,
): Promise<BlockParticipant[] | null> {
  if (block.attributeUuid === null) {
    return null;
  }

  const response = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}/attributes/${encodeURIComponent(block.attributeUuid)}/blocks/${encodeURIComponent(block.uuid)}`,
  );

  if (!response.ok) {
    console.error(
      `[getBlockParticipants] Failed to fetch participants of block ${block.uuid}:`,
      await response.text(),
    );
    return null;
  }

  const rows = (await response.json()) as Record<
    string,
    string | number | boolean | string[] | null
  >[];

  // Without participant fields the backend returns no rows, while v2 listed the occupants anonymously
  if (rows.length === 0) {
    return Array.from({ length: block.blockParticipantCount ?? 0 }, () => ({
      name: "",
    }));
  }

  return rows.map((row) => ({
    name: Object.keys(row)
      .toSorted((a, b) => Number(a) - Number(b))
      .map((key) => row[key])
      .filter((value) => value !== null && value !== "")
      .map((value) => (Array.isArray(value) ? value.join(", ") : String(value)))
      .join(" "),
  }));
}
