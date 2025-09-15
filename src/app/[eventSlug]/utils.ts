import { API_URL } from "@/lib/api";
import type { PublicBlock } from "@/types/blocks";

export function getAttributeLabel(name: string, language: string) {
  try {
    const parsed = JSON.parse(name) as Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return parsed[language] ?? parsed.pl ?? Object.values(parsed)[0] ?? name;
  } catch {
    return name;
  }
}

export async function getEventBlockAttributeBlocks(
  eventSlug: string,
  attributeId: string,
) {
  const blocksResponse = await fetch(
    `${API_URL}/events/${eventSlug}/attributes/${attributeId}/blocks`,
    {
      method: "GET",
    },
  );
  if (!blocksResponse.ok) {
    const error = (await blocksResponse.json()) as unknown;
    console.error(error);
    return null;
  }
  return (await blocksResponse.json()) as PublicBlock[];
}
