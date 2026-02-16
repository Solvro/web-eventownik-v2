import type { Row, Table } from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FlattenedParticipant } from "@/types/participant";

import { fetchAdditionalParticipantData } from "./columns";

interface ExpandRowCellProps {
  row: Row<FlattenedParticipant>;
  table: Table<FlattenedParticipant>;
  eventId: string;
}

export function ExpandRowCell({ row, table, eventId }: ExpandRowCellProps) {
  const isLoading = table.options.meta?.isRowLoading(row.index) ?? false;

  if (!row.getCanExpand()) {
    return null;
  }

  const handleToggle = async () => {
    await fetchAdditionalParticipantData(row, table, eventId);

    if (row.original.wasExpanded) {
      row.original.mode = "view";
    }

    row.toggleExpanded();
  };

  return (
    <Button
      size="icon"
      variant={row.getIsExpanded() ? "outline" : "eventGhost"}
      disabled={isLoading}
      onClick={handleToggle}
      aria-label={row.getIsExpanded() ? "Zwiń wiersz" : "Rozwiń wiersz"}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : row.getIsExpanded() ? (
        <ChevronDown />
      ) : (
        <ChevronLeft />
      )}
    </Button>
  );
}
