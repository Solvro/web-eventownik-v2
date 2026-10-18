"use client";

import {
  SortableTileGrid,
  TILE_GRID_CLASS_NAME,
} from "@/components/sortable-tile-grid";
import type { V3EmailSummary } from "@/types/v3";

import { reorderEmails } from "./actions";
import { EmailTemplateEntry } from "./template-entry";

export function SortableEmailGrid({
  templates,
  eventUuid,
  offset,
}: {
  templates: V3EmailSummary[];
  eventUuid: string;
  offset: number;
}) {
  return (
    <SortableTileGrid
      items={templates}
      className={TILE_GRID_CLASS_NAME}
      onReorder={async (orderedIds, previousIds) =>
        reorderEmails(eventUuid, orderedIds, previousIds, offset)
      }
      renderItem={(template) => (
        <EmailTemplateEntry emailTemplate={template} eventUuid={eventUuid} />
      )}
    />
  );
}
