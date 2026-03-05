"use client";

import type { Row, Table } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FlattenedParticipant } from "@/types/participant";

interface EditParticipantButtonProps {
  row: Row<FlattenedParticipant>;
  table: Table<FlattenedParticipant>;
}

export function EditParticipantButton({
  row,
  table,
}: EditParticipantButtonProps) {
  const participant = row.original;

  return (
    <Button
      variant="outline"
      type="button"
      size="icon"
      onClick={() => {
        table.options.meta?.updateData(row.index, {
          ...participant,
          mode: participant.mode === "edit" ? "view" : "edit",
        });
      }}
    >
      <Pencil />
    </Button>
  );
}
