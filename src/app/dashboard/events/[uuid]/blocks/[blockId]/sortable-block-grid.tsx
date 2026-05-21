"use client";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { Block } from "@/types/blocks";

import { reorderBlocks } from "../actions";
import { BlockEntry } from "./block-entry";

function SortableBlockGrid({
  blocks,
  eventUuid,
  attributeId,
}: {
  blocks: Block[];
  eventUuid: string;
  attributeId: string;
}) {
  return (
    <SortableTileGrid
      items={blocks}
      onReorder={async (orderedIds) =>
        reorderBlocks(eventUuid, attributeId, orderedIds)
      }
      renderItem={(block) => (
        <BlockEntry
          block={block}
          eventUuid={eventUuid}
          attributeId={attributeId}
        />
      )}
    />
  );
}

export { SortableBlockGrid };
