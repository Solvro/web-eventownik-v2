import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { FlattenedParticipant } from "@/types/participant";

interface TableSelectionInfoProps {
  table: Table<FlattenedParticipant>;
}

export function TableSelectionInfo({ table }: TableSelectionInfoProps) {
  const t = useTranslations("Table");
  const selection = table.options.meta?.selection;
  const selectedCount =
    selection?.participants?.length ??
    table.getFilteredSelectedRowModel().rows.length;
  const filteredRows = table.getFilteredRowModel().rows;
  const totalFilteredCount =
    table.options.meta?.totalParticipants ?? filteredRows.length;
  const canSelectAllFiltered =
    totalFilteredCount > 0 && selectedCount < totalFilteredCount;
  const isAllRowsSelected = selectedCount === totalFilteredCount;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-sm">
      <span>
        {t("selectedCount", {
          count: selectedCount,
          total: totalFilteredCount,
        })}
      </span>
      {canSelectAllFiltered && !isAllRowsSelected ? (
        <Button
          variant="link"
          size="sm"
          className="text-primary h-auto p-0"
          disabled={
            selection?.busy === true ||
            table.options.meta?.isBusy === true ||
            table.getRowModel().rows.some((row) => row.original.mode === "edit")
          }
          onClick={() => {
            if (selection === undefined) {
              table.toggleAllRowsSelected(true);
            } else {
              selection.onSelectAll();
            }
          }}
        >
          {t("selectAll", { count: totalFilteredCount })}
        </Button>
      ) : null}
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0"
        disabled={selection?.busy === true}
        onClick={() => {
          selection?.onClear();
          table.resetRowSelection();
        }}
      >
        {t("clearSelection")}
      </Button>
      {isAllRowsSelected && totalFilteredCount > 0 ? (
        <span className="text-primary">
          {t("allSelected", { count: totalFilteredCount })}
        </span>
      ) : null}
    </div>
  );
}
