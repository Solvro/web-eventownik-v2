"use client";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { EventEmail, SingleEventEmail } from "@/types/emails";

import { reorderEmails } from "./actions";
import { EmailTemplateEntry } from "./template-entry";

function SortableEmailGrid({
  templates,
  eventId,
  singleEmails,
}: {
  templates: EventEmail[];
  eventId: string;
  singleEmails: Record<number, SingleEventEmail | null>;
}) {
  return (
    <SortableTileGrid
      items={templates}
      onReorder={async (orderedIds) => reorderEmails(eventId, orderedIds)}
      renderItem={(template) => (
        <EmailTemplateEntry
          emailTemplate={template}
          eventId={eventId}
          singleEmail={singleEmails[template.id] ?? null}
        />
      )}
    />
  );
}

export { SortableEmailGrid };
