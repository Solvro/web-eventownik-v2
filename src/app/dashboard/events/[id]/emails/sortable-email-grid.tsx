"use client";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { EventEmail } from "@/types/emails";

import { reorderEmails } from "./actions";
import { EmailTemplateEntry } from "./template-entry";

function SortableEmailGrid({
  templates,
  eventId,
}: {
  templates: EventEmail[];
  eventId: string;
}) {
  return (
    <SortableTileGrid
      items={templates}
      onReorder={async (orderedIds) => reorderEmails(eventId, orderedIds)}
      renderItem={(template) => (
        <EmailTemplateEntry emailTemplate={template} eventId={eventId} />
      )}
    />
  );
}

export { SortableEmailGrid };
