import type { Table } from "@tanstack/react-table";
import { ArrowUpDown, FilterX } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EventEmail } from "@/types/emails";
import type { FlattenedParticipant } from "@/types/participant";

import { DeleteManyParticipantsDialog } from "./delete-many-dialog";
import { ExportButton } from "./export-button";
import { SendMailForm } from "./send-mail-form";

interface TableToolbarProps {
  table: Table<FlattenedParticipant>;
  globalFilter: string;
  eventId: string;
  emails: EventEmail[] | null;
  isQuerying: boolean;
  deleteManyParticipants: (_participants: string[]) => Promise<void>;
  pageBeforeSearch: number;
  setIsUserSearching: Dispatch<SetStateAction<boolean>>;
}

export function TableToolbar({
  table,
  globalFilter,
  eventId,
  emails,
  isQuerying,
  deleteManyParticipants,
  pageBeforeSearch,
  setIsUserSearching,
}: TableToolbarProps) {
  return (
    <>
      <Input
        className="h-10 w-32"
        placeholder="Wyszukaj..."
        value={globalFilter}
        onChange={(event) => {
          setIsUserSearching(true);
          const searchValue = event.target.value;
          table.setGlobalFilter(searchValue);

          if (
            pageBeforeSearch > 0 &&
            table.getState().pagination.pageIndex > 0
          ) {
            table.firstPage();
          } else if (searchValue === "") {
            table.setPageIndex(pageBeforeSearch);
            setIsUserSearching(false);
          }
        }}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => {
              table.resetColumnFilters();
            }}
            size="icon"
            variant="outline"
            aria-label="Resetuj wszystkie filtry"
          >
            <FilterX />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Resetuj wszystkie filtry</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => {
              table.resetSorting();
            }}
            size="icon"
            variant="outline"
            aria-label="Resetuj sortowanie"
          >
            <ArrowUpDown />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Resetuj sortowanie</TooltipContent>
      </Tooltip>
      <SendMailForm
        eventId={eventId}
        targetParticipants={table
          .getSelectedRowModel()
          .rows.map((row) => row.original)}
        emails={emails}
      />
      <ExportButton eventId={eventId} />
      <DeleteManyParticipantsDialog
        isQuerying={isQuerying}
        participants={table
          .getSelectedRowModel()
          .rows.map((row) => row.original.id.toString())}
        deleteManyParticipants={deleteManyParticipants}
      />
    </>
  );
}
