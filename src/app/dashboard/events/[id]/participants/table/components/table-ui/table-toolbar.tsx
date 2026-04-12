import type { Table } from "@tanstack/react-table";
import { ArrowUpDown, FilterX, SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { EventEmail } from "@/types/emails";
import type { FlattenedParticipant } from "@/types/participant";

import { ExportButton } from "../buttons/export-button";
import { BulkEditDialog } from "../dialogs/bulk-edit-dialog";
import { DeleteManyParticipantsDialog } from "../dialogs/delete-many-dialog";
import { SendMailForm } from "../dialogs/send-mail-form";

interface TableToolbarProps {
  table: Table<FlattenedParticipant>;
  globalFilter: string;
  eventId: string;
  emails: EventEmail[] | null;
  isQuerying: boolean;
  attributes: Attribute[];
  blocks: (Block | null)[];
  deleteManyParticipants: (_participants: string[]) => Promise<void>;
}

export function TableToolbar({
  table,
  globalFilter,
  eventId,
  emails,
  isQuerying,
  attributes,
  blocks,
  deleteManyParticipants,
}: TableToolbarProps) {
  const t = useTranslations("Table");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="bg-background! h-10 w-full md:w-64">
        <InputGroupInput
          placeholder={t("searchPlaceholder")}
          value={globalFilter}
          onChange={(event) => {
            table.setGlobalFilter(event.target.value);
          }}
        />
        <InputGroupAddon align={"inline-end"}>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
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
        <BulkEditDialog
          table={table}
          attributes={attributes}
          blocks={blocks}
          eventId={eventId}
        />
        <DeleteManyParticipantsDialog
          isQuerying={isQuerying}
          participants={table
            .getSelectedRowModel()
            .rows.map((row) => row.original.id.toString())}
          deleteManyParticipants={deleteManyParticipants}
        />
      </div>
    </div>
  );
}
