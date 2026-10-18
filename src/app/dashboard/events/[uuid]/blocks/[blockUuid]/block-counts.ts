import type { Block } from "@/types/blocks";

/**
 * Sums block occupancy. Returns "–" when any count is missing, so an
 * incomplete backend response is shown as unknown instead of `NaN` or a
 * misleading partial total.
 */
export function totalBlockParticipants(blocks: Block[]): number | string {
  let total = 0;
  for (const block of blocks) {
    const count = block.blockParticipantCount as number | null | undefined;
    if (typeof count !== "number" || !Number.isFinite(count)) {
      return "–";
    }
    total += count;
  }
  return total;
}
