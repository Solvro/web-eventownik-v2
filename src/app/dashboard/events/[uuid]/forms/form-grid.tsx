"use client";

import {
  SortableTileGrid,
  TILE_GRID_CLASS_NAME,
} from "@/components/sortable-tile-grid";
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
  return (
    <SortableTileGrid
      items={forms}
      className={TILE_GRID_CLASS_NAME}
      onReorder={async (orderedIds, previousIds) =>
        reorderForms(eventUuid, orderedIds, previousIds, offset)
      }
      renderItem={(form) => <FormEntry form={form} eventUuid={eventUuid} />}
    />
  );
}
