"use client";

import { useRouter } from "next/navigation";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
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
  const router = useRouter();
  return (
    <SortableTileGrid
      items={templates}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      onReorder={async (ids) => {
        try {
          return await reorderEmails(
            eventUuid,
            ids,
            templates.map((template) => template.id),
            offset,
          );
        } finally {
          router.refresh();
        }
      }}
      renderItem={(template) => (
        <EmailTemplateEntry emailTemplate={template} eventUuid={eventUuid} />
      )}
    />
  );
}
