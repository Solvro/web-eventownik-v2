"use client";

import type { Row, Table } from "@tanstack/react-table";
import { Loader, Pencil, Save, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { FlattenedParticipant } from "@/types/participant";

import { updateParticipant } from "../../../actions";

interface EditParticipantButtonProps {
  row: Row<FlattenedParticipant>;
  table: Table<FlattenedParticipant>;
}

export function EditParticipantButton({
  row,
  table,
}: EditParticipantButtonProps) {
  const participant = row.original;
  const isEditing = participant.mode === "edit";
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  function enterEditMode() {
    table.options.meta?.updateData(row.index, {
      ...participant,
      mode: "edit",
    });
  }

  function cancelEdit() {
    table.options.meta?.updateData(row.index, {
      ...participant,
      mode: "view",
    });
  }

  async function saveChanges() {
    const eventId = table.options.meta?.eventId;
    if (eventId == null) {
      return;
    }

    const attributeValues: Record<number, string> = {};
    const baseUpdates: Record<string, unknown> = {};

    for (const column of table.getAllColumns()) {
      const attribute = column.columnDef.meta?.attribute;
      if (attribute != null) {
        const value = participant[attribute.id.toString()];
        attributeValues[attribute.id] = value == null ? "" : String(value);
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
    const { success } = await updateParticipant(
      eventId,
      participant.id.toString(),
      {
        participantAttributes: attributeValues,
        ...baseUpdates,
      },
    );
    setIsSaving(false);

    if (success) {
      toast({
        title: "Zapisano zmiany w uczestniku",
      });
      table.options.meta?.updateData(row.index, {
        ...participant,
        mode: "view",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Nie udało się zapisać zmian w uczestniku!",
      });
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1">
        <Button
          variant="eventGhost"
          type="button"
          disabled={isSaving}
          onClick={() => {
            void saveChanges();
          }}
          aria-label="save"
          size="sm"
        >
          {isSaving ? (
            <Loader className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
        </Button>
        <Button
          variant="eventGhost"
          type="button"
          onClick={cancelEdit}
          aria-label="cancel"
          size="sm"
        >
          <X size={16} />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="eventGhost"
      type="button"
      aria-label={"edit"}
      onClick={enterEditMode}
    >
      <Pencil />
    </Button>
  );
}
