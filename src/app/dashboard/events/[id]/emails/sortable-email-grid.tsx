"use client";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("EventDetails");

  return (
    <SortableTileGrid
      items={templates}
      onReorder={async (orderedIds) => reorderEmails(eventId, orderedIds, t)}
      renderItem={(template) => (
        <EmailTemplateEntry emailTemplate={template} eventId={eventId} />
      )}
    />
  );
}

export { SortableEmailGrid };
