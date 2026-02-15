import type { Table } from "@tanstack/react-table";
import { useState } from "react";

import type { EventEmail } from "@/types/emails";
import type { FlattenedParticipant } from "@/types/participant";

import { TablePagination } from "./table-pagination";
import { TableSelectionInfo } from "./table-selection-info";
import { TableToolbar } from "./table-toolbar";

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
  // allows for coming back to the page where user started typing in searchbox
  const [pageBeforeSearch, setPageBeforeSearch] = useState(
    table.getState().pagination.pageIndex,
  );
  const [isUserSearching, setIsUserSearching] = useState(false);

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-x-2">
      <div className="flex items-center gap-x-2">
        <TableToolbar
          table={table}
          globalFilter={globalFilter}
          eventId={eventId}
          emails={emails}
          isQuerying={isQuerying}
          deleteManyParticipants={deleteManyParticipants}
          pageBeforeSearch={pageBeforeSearch}
          setIsUserSearching={setIsUserSearching}
        />
        <TableSelectionInfo table={table} />
      </div>

      <TablePagination
        table={table}
        isUserSearching={isUserSearching}
        setPageBeforeSearch={setPageBeforeSearch}
      />
    </div>
  );
}
