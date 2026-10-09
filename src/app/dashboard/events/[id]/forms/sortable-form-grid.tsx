"use client";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { EventForm } from "@/types/forms";

import { reorderForms } from "./actions";
import { FormEntry } from "./form-entry";

function SortableFormGrid({
  forms,
  eventId,
  labelledBy,
}: {
  forms: EventForm[];
  eventId: string;
  labelledBy: string;
}) {
  return (
    <SortableTileGrid
      labelledBy={labelledBy}
      items={forms}
      onReorder={async (orderedIds) => reorderForms(eventId, orderedIds)}
      renderItem={(form) => <FormEntry form={form} eventId={eventId} />}
    />
  );
}

export { SortableFormGrid };
