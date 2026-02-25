import type { Table } from "@tanstack/react-table";
import { ArrowUpDown, FilterX } from "lucide-react";
import { useTranslations } from "next-intl";
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

import { ExportButton } from "../buttons/export-button";
import { DeleteManyParticipantsDialog } from "../dialogs/delete-many-dialog";
import { SendMailForm } from "../dialogs/send-mail-form";
import { ColumnVisibilityDropdown } from "./column-visibility-dropdown";

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
  const t = useTranslations("Table");

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        className="h-10 w-full md:w-32"
        placeholder={t("searchPlaceholder")}
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
      <div className="flex gap-4 max-md:w-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                table.resetColumnFilters();
              }}
              size="icon"
              variant="outline"
              aria-label={t("resetFilters")}
            >
              <FilterX />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("resetFilters")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                table.resetSorting();
              }}
              size="icon"
              variant="outline"
              aria-label={t("resetSorting")}
            >
              <ArrowUpDown />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("resetSorting")}</TooltipContent>
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
        <ColumnVisibilityDropdown table={table} />
      </div>
    </div>
  );
}
