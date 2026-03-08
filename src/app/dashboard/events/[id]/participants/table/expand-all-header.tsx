import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import type { FlattenedParticipant } from "@/types/participant";

import { fetchAdditionalParticipantData } from "./columns";

interface ExpandAllHeaderProps {
  table: Table<FlattenedParticipant>;
  eventId: string;
}

export function ExpandAllHeader({ table, eventId }: ExpandAllHeaderProps) {
  const isAnyExpanded =
    table.getIsSomeRowsExpanded() || table.getIsAllRowsExpanded();

  const handleExpandToggle = async () => {
    if (isAnyExpanded) {
      table.resetExpanded();
    } else {
      const rowsToFetch = table
        .getCoreRowModel()
        .rows.filter((row) => !row.original.wasExpanded);

      if (rowsToFetch.length > 0) {
        await Promise.all(
          rowsToFetch.map(async (row) =>
            fetchAdditionalParticipantData(row, table, eventId),
          ),
        );
      }
      table.toggleAllRowsExpanded(true);
    }
  };

  return (
    <Button
      variant="eventGhost"
      size="sm"
      className="h-8 px-2"
      onClick={handleExpandToggle}
    >
      {isAnyExpanded ? "Zwiń" : "Rozwiń"}
    </Button>
  );
}
