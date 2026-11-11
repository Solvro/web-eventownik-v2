"use client";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { EventForm } from "@/types/forms";

import { reorderForms } from "./actions";
import { FormEntry } from "./form-entry";

function SortableFormGrid({
  forms,
  eventUuid,
}: {
  forms: EventForm[];
  eventUuid: string;
}) {
  return (
    <SortableTileGrid
      items={forms}
      onReorder={async (orderedIds) => reorderForms(eventUuid, orderedIds)}
      renderItem={(form) => <FormEntry form={form} eventUuid={eventUuid} />}
    />
  );
}

export { SortableFormGrid };
