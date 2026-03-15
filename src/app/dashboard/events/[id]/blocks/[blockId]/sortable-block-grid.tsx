"use client";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { Block } from "@/types/blocks";
import type { Participant } from "@/types/participant";

import { reorderBlocks } from "../actions";
import { BlockEntry } from "./block-entry";

function SortableBlockGrid({
  blocks,
  eventId,
  attributeId,
  participantsByBlock,
}: {
  blocks: Block[];
  eventId: string;
  attributeId: string;
  participantsByBlock: Record<number, Participant[]>;
}) {
  return (
    <SortableTileGrid
      items={blocks}
      onReorder={async (orderedIds) =>
        reorderBlocks(eventId, attributeId, orderedIds)
      }
      renderItem={(block) => (
        <BlockEntry
          block={block}
          eventId={eventId}
          attributeId={attributeId}
          participantsInBlock={participantsByBlock[block.id] ?? []}
        />
      )}
    />
  );
}

export { SortableBlockGrid };
