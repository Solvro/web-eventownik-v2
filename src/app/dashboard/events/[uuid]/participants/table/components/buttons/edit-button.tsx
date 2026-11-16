"use client";

import type { Row, Table } from "@tanstack/react-table";
import { Loader, Pencil, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useToast } from "@/hooks/use-toast";
import type {
  FlattenedParticipant,
  ParticipantAttributeValueType,
} from "@/types/participant";

import { updateParticipant } from "../../../actions";
import { toBackendAttributeValue } from "../../core/utils";

interface EditParticipantButtonProps {
  row: Row<FlattenedParticipant>;
  table: Table<FlattenedParticipant>;
}

function toComparable(value: ParticipantAttributeValueType) {
  return value == null ? "" : String(value);
}

function areRowsEqual(
  current: FlattenedParticipant,
  previous: FlattenedParticipant,
) {
  const normalizedCurrent = { ...current, mode: "view" };
  const normalizedPrevious = { ...previous, mode: "view" };
  return (
    JSON.stringify(normalizedCurrent) === JSON.stringify(normalizedPrevious)
  );
}

export function EditParticipantButton({
  row,
  table,
}: EditParticipantButtonProps) {
  const t = useTranslations("Table");
  const participant = row.original;
  const isEditing = participant.mode === "edit";
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const { toast } = useToast();

  function enterEditMode() {
    table.options.meta?.setRowSnapshot(row.index, participant);
    table.options.meta?.updateData(row.index, {
      ...participant,
      mode: "edit",
    });
  }

  function cancelEdit() {
    const snapshot = table.options.meta?.getRowSnapshot(row.index);

    if (snapshot == null) {
      table.options.meta?.updateData(row.index, {
        ...participant,
        mode: "view",
      });
    } else {
      table.options.meta?.updateData(row.index, {
        ...snapshot,
        mode: "view",
      });
    }

    table.options.meta?.clearRowSnapshot(row.index);
  }

  async function saveChanges() {
    const eventUuid = table.options.meta?.eventUuid;
    if (eventUuid == null) {
      return;
    }

    // Only changed values are sent. The backend recreates every sent attribute, which deletes
    // files it can't match and triggers "attribute changed" emails even for the same value
    const snapshot = table.options.meta?.getRowSnapshot(row.index);
    const attributeValues: Record<string, unknown> = {};
    const baseUpdates: Record<string, unknown> = {};

    for (const column of table.getAllColumns()) {
      const attribute = column.columnDef.meta?.attribute;
      const key = attribute?.uuid ?? column.id;
      if (
        snapshot != null &&
        toComparable(participant[key]) === toComparable(snapshot[key])
      ) {
        continue;
      }

      if (attribute != null) {
        attributeValues[attribute.uuid] = toBackendAttributeValue(
          attribute.type,
          toComparable(participant[attribute.uuid]),
        );
      } else if (
        column.id !== "select" &&
        column.id !== "no" &&
        column.id !== "edit"
      ) {
        // Collect basic fields, assuming column.id corresponds to participant keys like 'email'
        baseUpdates[column.id] = participant[column.id];
      }
    }

    setIsSaving(true);
    const { success } = await updateParticipant(eventUuid, participant.uuid, {
      participantAttributes: attributeValues,
      ...baseUpdates,
    });
    setIsSaving(false);

    if (success) {
      toast({
        title: t("editParticipantSuccess"),
      });
      table.options.meta?.updateData(row.index, {
        ...participant,
        mode: "view",
      });
      table.options.meta?.clearRowSnapshot(row.index);
    } else {
      toast({
        variant: "destructive",
        title: t("editParticipantError"),
      });
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          variant="eventDefault"
          type="button"
          disabled={isSaving}
          onClick={() => {
            void saveChanges();
          }}
          aria-label={t("save")}
          size="sm"
        >
          {isSaving ? (
            <Loader className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
        </Button>
        <Button
          variant="destructive"
          type="button"
          onClick={() => {
            const snapshot = table.options.meta?.getRowSnapshot(row.index);
            if (snapshot != null && !areRowsEqual(participant, snapshot)) {
              setIsDiscardDialogOpen(true);
              return;
            }

            cancelEdit();
          }}
          aria-label={t("cancel")}
          size="sm"
        >
          <X size={16} />
        </Button>
        <UnsavedChangesAlert
          active={isDiscardDialogOpen}
          setActive={setIsDiscardDialogOpen}
          setDialogOpen={setIsDiscardDialogOpen}
          onCancel={() => {
            setIsDiscardDialogOpen(false);
          }}
          onConfirm={cancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Button
        variant="default"
        className="bg-background text-foreground p-3 hover:bg-(--event-primary-color) hover:text-(--event-primary-foreground-color)"
        type="button"
        aria-label={t("edit")}
        onClick={enterEditMode}
      >
        <Pencil />
      </Button>
    </div>
  );
}
