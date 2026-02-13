import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlattenedParticipant } from "@/types/participant";

import { getPaginationInfoText } from "./utils";

interface TablePaginationProps {
  table: Table<FlattenedParticipant>;
  isUserSearching: boolean;
  setPageBeforeSearch: Dispatch<SetStateAction<number>>;
}

export function TablePagination({
  table,
  isUserSearching,
  setPageBeforeSearch,
}: TablePaginationProps) {
  return (
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
              setPageBeforeSearch((previous) => previous - 1);
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
              setPageBeforeSearch((previous) => previous + 1);
            }
          }}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
