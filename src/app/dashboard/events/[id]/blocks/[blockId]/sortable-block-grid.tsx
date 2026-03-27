"use client";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { Block } from "@/types/blocks";

import { reorderBlocks } from "../actions";
import { BlockEntry } from "./block-entry";

function SortableBlockGrid({
  blocks,
  eventId,
  attributeId,
}: {
  blocks: Block[];
  eventId: string;
  attributeId: string;
}) {
  return (
    <SortableTileGrid
      items={blocks}
      onReorder={async (orderedIds) =>
        reorderBlocks(eventId, attributeId, orderedIds)
      }
      renderItem={(block) => (
        <BlockEntry block={block} eventId={eventId} attributeId={attributeId} />
      )}
    />
  );
}

export { SortableBlockGrid };
