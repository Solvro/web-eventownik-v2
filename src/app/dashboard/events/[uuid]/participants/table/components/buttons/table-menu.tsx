import type { Table } from "@tanstack/react-table";

import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { EventEmail } from "@/types/emails";
import type { FlattenedParticipant } from "@/types/participant";

import { ImportParticipantsDialog } from "../../import-participants-dialog";
import { ColumnSettingsDropdown } from "../table-ui/column-settings-dropdown";
import { TableSelectionInfo } from "../table-ui/table-selection-info";
import { TableToolbar } from "../table-ui/table-toolbar";

export function TableMenu({
  table,
  globalFilter,
  eventUuid,
  emails,
  isQuerying,
  attributes,
  blocks,
  deleteManyParticipants,
}: {
  table: Table<FlattenedParticipant>;
  globalFilter: string;
  eventUuid: string;
  emails: EventEmail[] | null;
  isQuerying: boolean;
  attributes: Attribute[];
  blocks: (Block | null)[];
  deleteManyParticipants: (_participants: string[]) => Promise<void>;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-x-2 max-md:w-full">
        <TableToolbar
          table={table}
          globalFilter={globalFilter}
          eventUuid={eventUuid}
          emails={emails}
          isQuerying={isQuerying}
          attributes={attributes}
          blocks={blocks}
          deleteManyParticipants={deleteManyParticipants}
        />
        <TableSelectionInfo table={table} />
      </div>
      <div className="flex items-center gap-2 max-md:w-full max-md:justify-end">
        <ImportParticipantsDialog
          eventUuid={eventUuid}
          attributes={attributes}
          blocks={blocks}
        />
        <ColumnSettingsDropdown table={table} />
      </div>
    </div>
  );
}
