"use client";

import { useTranslations } from "next-intl";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { EventForm } from "@/types/forms";

import { reorderForms } from "./actions";
import { FormEntry } from "./form-entry";

function SortableFormGrid({
  forms,
  eventId,
}: {
  forms: EventForm[];
  eventId: string;
}) {
  const t = useTranslations("EventDetails");

  return (
    <SortableTileGrid
      items={forms}
      onReorder={async (orderedIds) => reorderForms(eventId, orderedIds, t)}
      renderItem={(form) => <FormEntry form={form} eventId={eventId} />}
    />
  );
}

export { SortableFormGrid };
