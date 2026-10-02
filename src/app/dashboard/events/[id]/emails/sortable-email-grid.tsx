"use client";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { EventEmail } from "@/types/emails";

import { reorderEmails } from "./actions";
import { EmailTemplateEntry } from "./template-entry";

function SortableEmailGrid({
  templates,
  eventId,
  labelledBy,
}: {
  templates: EventEmail[];
  eventId: string;
  labelledBy: string;
}) {
  return (
    <SortableTileGrid
      labelledBy={labelledBy}
      items={templates}
      onReorder={async (orderedIds) => reorderEmails(eventId, orderedIds)}
      renderItem={(template) => (
        <EmailTemplateEntry emailTemplate={template} eventId={eventId} />
      )}
    />
  );
}

export { SortableEmailGrid };
