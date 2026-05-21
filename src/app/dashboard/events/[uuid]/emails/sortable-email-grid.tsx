"use client";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { EventEmail } from "@/types/emails";

import { reorderEmails } from "./actions";
import { EmailTemplateEntry } from "./template-entry";

function SortableEmailGrid({
  templates,
  eventUuid,
}: {
  templates: EventEmail[];
  eventUuid: string;
}) {
  return (
    <SortableTileGrid
      items={templates}
      onReorder={async (orderedIds) => reorderEmails(eventUuid, orderedIds)}
      renderItem={(template) => (
        <EmailTemplateEntry emailTemplate={template} eventUuid={eventUuid} />
      )}
    />
  );
}

export { SortableEmailGrid };
