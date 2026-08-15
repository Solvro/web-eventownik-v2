import type { Participant } from "@/types/participant";

export interface AttributeValueCount {
  value: string;
  count: number;
}

function normalizeValues(raw: string | string[] | undefined): string[] {
  if (raw == null) {
    return [];
  }
  const values = Array.isArray(raw) ? raw : [raw];
  return values
    .map((value) => (typeof value === "string" ? value.trim() : String(value)))
    .filter((value) => value.length > 0);
}

/**
 * Counts how many participants selected each value of a given attribute.
 *
 * - Multiselect values (arrays) are counted per option, so totals can exceed the
 *   participant count.
 * - Blank / missing answers are grouped into a single trailing entry labelled
 *   `noAnswerLabel` (only added when there is at least one such participant).
 * - Results are ordered by descending count, then alphabetically for stability.
 *
 * Pure and i18n-agnostic: the caller passes the localized "no answer" label.
 */
export function countAttributeValues(
  participants: Participant[],
  attributeUuid: string,
  noAnswerLabel: string,
): AttributeValueCount[] {
  const counts = new Map<string, number>();
  let noAnswer = 0;

  for (const participant of participants) {
    const attribute = participant.attributes.find(
      (candidate) => candidate.uuid === attributeUuid,
    );
    const values = normalizeValues(attribute?.value);

    if (values.length === 0) {
      noAnswer += 1;
      continue;
    }

    for (const value of values) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  const result = [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .toSorted((a, b) => b.count - a.count || a.value.localeCompare(b.value));

  if (noAnswer > 0) {
    result.push({ value: noAnswerLabel, count: noAnswer });
  }

  return result;
}
