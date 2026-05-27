import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { FlattenedParticipant } from "@/types/participant";

interface TableSelectionInfoProps {
  table: Table<FlattenedParticipant>;
}

export function TableSelectionInfo({ table }: TableSelectionInfoProps) {
  const t = useTranslations("Table");
  const selectedCount = table.getSelectedRowModel().rows.length;
  const pageRows = table.getPaginationRowModel().rows;
  const totalFilteredCount = table.getFilteredRowModel().rows.length;

  const allSelectedOnPage =
    pageRows.length > 0 && pageRows.every((r) => r.getIsSelected());
  const hasMoreThanOnePage = totalFilteredCount > pageRows.length;
  const isAllRowsSelected = table.getIsAllRowsSelected();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="text-muted-foreground flex items-center gap-x-2 text-sm">
      <span>{t("selectedCount", { count: selectedCount })}</span>
      {allSelectedOnPage && hasMoreThanOnePage && !isAllRowsSelected ? (
        <Button
          variant="link"
          size="sm"
          className="text-primary h-auto p-0"
          onClick={() => {
            table.toggleAllRowsSelected(true);
          }}
        >
          {t("selectAll", { count: totalFilteredCount })}
        </Button>
      ) : null}
      {isAllRowsSelected && hasMoreThanOnePage ? (
        <span className="text-primary">
          {t("allSelected", { count: totalFilteredCount })}
        </span>
      ) : null}
    </div>
  );
}
