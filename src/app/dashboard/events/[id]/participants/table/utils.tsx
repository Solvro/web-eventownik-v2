import type { SortDirection, Table } from "@tanstack/react-table";

import type { FlattenedParticipant } from "@/types/participant";

export function getPaginationInfoText(table: Table<FlattenedParticipant>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  return `${
    table.getPaginationRowModel().rows.length === 0
      ? "0"
      : (pageIndex * pageSize + 1).toString()
  }-${Math.min(pageSize * pageIndex + pageSize, table.getRowCount()).toString()} z ${table.getRowCount().toString()}`;
}

export function getAriaSort(
  sortDirection: SortDirection | false,
): "none" | "ascending" | "descending" | "other" | undefined {
  if (sortDirection === false) {
    return "none";
  }
  if (sortDirection === "asc") {
    return "ascending";
  }
  return "descending";
}
