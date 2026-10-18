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
import type { Block } from "@/types/blocks";
import type { FlattenedParticipant } from "@/types/participant";
import type {
  V3Attribute as Attribute,
  V3EmailSummary as EventEmail,
} from "@/types/v3";

import { ExportButton } from "../buttons/export-button";
import { BulkEditDialog } from "../dialogs/bulk-edit-dialog";
import { DeleteManyParticipantsDialog } from "../dialogs/delete-many-dialog";
import { SendMailForm } from "../dialogs/send-mail-form";

interface TableToolbarProps {
  table: Table<FlattenedParticipant>;
  globalFilter: string;
  eventUuid: string;
  emails: EventEmail[] | null;
  isQuerying: boolean;
  attributes: Attribute[];
  blocks: (Block | null)[];
  deleteManyParticipants: (_participants: string[]) => Promise<void>;
}

export function TableToolbar({
  table,
  globalFilter,
  eventUuid,
  emails,
  isQuerying,
  attributes,
  blocks,
  deleteManyParticipants,
}: TableToolbarProps) {
  const t = useTranslations("Table");
  const participantsCount =
    table.options.meta?.totalParticipants ??
    table.getFilteredRowModel().rows.length;
  const selectedParticipants =
    table.options.meta?.selection?.participants ??
    table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="bg-background! h-10 w-full md:w-66">
        <InputGroupInput
          placeholder={t("searchPlaceholder", {
            count: participantsCount,
          })}
          value={globalFilter}
          disabled={isQuerying || table.options.enableGlobalFilter === false}
          onChange={(event) => {
            table.setGlobalFilter(event.target.value);
          }}
        />
        <InputGroupAddon align={"inline-end"}>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      <div className="flex gap-2 max-md:w-full md:gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                table.resetColumnFilters();
                table.setGlobalFilter("");
              }}
              size="icon"
              disabled={isQuerying || table.options.enableFilters === false}
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
              disabled={isQuerying || table.options.enableSorting === false}
              variant="outline"
              aria-label={t("resetSorting")}
            >
              <ArrowUpDown />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("resetSorting")}</TooltipContent>
        </Tooltip>
        <SendMailForm
          eventUuid={eventUuid}
          targetParticipants={selectedParticipants}
          emails={emails}
        />
        <ExportButton eventUuid={eventUuid} />
        <BulkEditDialog
          table={table}
          attributes={attributes}
          blocks={blocks}
          eventUuid={eventUuid}
        />
        <DeleteManyParticipantsDialog
          isQuerying={isQuerying}
          participants={selectedParticipants.map(
            (participant) => participant.uuid,
          )}
          deleteManyParticipants={deleteManyParticipants}
        />
      </div>
    </div>
  );
}
