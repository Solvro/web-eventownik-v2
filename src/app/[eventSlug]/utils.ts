import { API_URL } from "@/lib/api";
import { getBackend } from "@/lib/backend";
import type { V3Block } from "@/types/v3";

export async function getEventBlockAttributeBlocks(
  eventSlug: string,
  attributeUuid: string,
) {
  try {
    return await getBackend<V3Block>(
      `${API_URL}/public/events/${encodeURIComponent(eventSlug)}/attributes/${encodeURIComponent(attributeUuid)}/blocks`,
    );
  } catch {
    return null;
  }
}
