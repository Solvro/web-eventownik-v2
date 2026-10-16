"use client";

import { useRouter } from "next/navigation";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import type { V3FormSummary } from "@/types/v3";

import { reorderForms } from "./actions";
import { FormEntry } from "./form-entry";

export function FormGrid({
  forms,
  eventUuid,
  offset,
}: {
  forms: V3FormSummary[];
  eventUuid: string;
  offset: number;
}) {
  const router = useRouter();
  return (
    <SortableTileGrid
      items={forms}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
      onReorder={async (ids) => {
        try {
          return await reorderForms(
            eventUuid,
            ids,
            forms.map((form) => form.uuid),
            offset,
          );
        } finally {
          router.refresh();
        }
      }}
      renderItem={(form) => <FormEntry form={form} eventUuid={eventUuid} />}
    />
  );
}
