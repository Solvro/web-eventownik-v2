"use client";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type {
  ColumnFiltersState,
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { V3EmailDelivery } from "@/types/v3";

import { getColumns } from "./columns";

export interface EmailHistoryState {
  globalFilter: string;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  onGlobalFilterChange: OnChangeFn<string>;
  onSortingChange: OnChangeFn<SortingState>;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
}

export function useEmailHistoryTable(
  data: V3EmailDelivery[],
  state: EmailHistoryState,
) {
  const t = useTranslations("EmailHistoryTable");
  const columns = useMemo(() => getColumns(t), [t]);
  return useReactTable({
    data,
    columns,
    state: {
      globalFilter: state.globalFilter,
      sorting: state.sorting,
      columnFilters: state.columnFilters,
    },
    onGlobalFilterChange: state.onGlobalFilterChange,
    onSortingChange: state.onSortingChange,
    onColumnFiltersChange: state.onColumnFiltersChange,
    manualFiltering: true,
    manualSorting: true,
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
  });
}
