"use client";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { Block, BlockParticipant } from "@/types/blocks";

import { reorderBlocks } from "../actions";
import { BlockEntry } from "./block-entry";

function SortableBlockGrid({
  blocks,
  eventUuid,
  attributeUuid,
  participantsByBlockUuid,
}: {
  blocks: Block[];
  eventUuid: string;
  attributeUuid: string;
  participantsByBlockUuid: Record<string, BlockParticipant[]>;
}) {
  return (
    <SortableTileGrid
      items={blocks}
      onReorder={async (orderedIds) =>
        reorderBlocks(eventUuid, attributeUuid, orderedIds)
      }
      renderItem={(block) => (
        <BlockEntry
          block={block}
          eventUuid={eventUuid}
          attributeUuid={attributeUuid}
          participants={participantsByBlockUuid[block.uuid] ?? []}
        />
      )}
    />
  );
}

export { SortableBlockGrid };
