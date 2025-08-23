import type { Table } from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, FilterX } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getPaginationInfoText } from "./utils";

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
        <Input
          className="h-10 w-32"
          placeholder="Wyszukaj..."
          value={globalFilter}
          onChange={(event) => {
            // TODO maybe some debouncing?
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
        ></Input>
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
      </div>
      <div className="ml-auto flex items-center gap-x-2">
        <Select
          onValueChange={(value) => {
            table.setPageSize(
              value === "all"
                ? table.getFilteredRowModel().rows.length
                : Number(value),
            );
          }}
          defaultValue={table.getState().pagination.pageSize.toString()}
        >
          <SelectTrigger className="h-10 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Wierszy na stronę</SelectLabel>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="all">Wszystkie</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className="mr-2">{getPaginationInfoText(table)}</span>
        <div className="flex gap-x-0">
          <Button
            variant="outline"
            size="icon"
            disabled={!table.getCanPreviousPage()}
            onClick={() => {
              table.previousPage();
              if (!isUserSearching) {
                setPageBeforeSearch((previous) => {
                  return previous - 1;
                });
              }
            }}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!table.getCanNextPage()}
            onClick={() => {
              table.nextPage();
              if (!isUserSearching) {
                setPageBeforeSearch((previous) => {
                  return previous + 1;
                });
              }
            }}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
