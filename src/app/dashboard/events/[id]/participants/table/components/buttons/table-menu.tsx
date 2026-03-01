import type { Table } from "@tanstack/react-table";

import type { EventEmail } from "@/types/emails";
import type { FlattenedParticipant } from "@/types/participant";

import { TableSelectionInfo } from "../table-ui/table-selection-info";
import { TableToolbar } from "../table-ui/table-toolbar";

export function TableMenu({
  table,
  globalFilter,
  eventId,
  emails,
  isQuerying,
  deleteManyParticipants,
}: {
  table: Table<FlattenedParticipant>;
  globalFilter: string;
  eventId: string;
  emails: EventEmail[] | null;
  isQuerying: boolean;
  deleteManyParticipants: (_participants: string[]) => Promise<void>;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-x-2 max-md:w-full">
        <TableToolbar
          table={table}
          globalFilter={globalFilter}
          eventId={eventId}
          emails={emails}
          isQuerying={isQuerying}
          deleteManyParticipants={deleteManyParticipants}
        />
        <TableSelectionInfo table={table} />
      </div>
    </div>
  );
}
