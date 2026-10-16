/* eslint-disable unicorn/prevent-abbreviations */
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnFiltersState,
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState } from "react";

import { createColumns } from "@/app/dashboard/events/[uuid]/participants/table/core/columns";
import { useToast } from "@/hooks/use-toast";
import type { Block } from "@/types/blocks";
import type {
  FlattenedParticipant,
  ParticipantSelection,
} from "@/types/participant";
import type { V3Attribute as Attribute } from "@/types/v3";

function cloneParticipantRow(row: FlattenedParticipant): FlattenedParticipant {
  return typeof structuredClone === "function"
    ? structuredClone(row)
    : { ...row };
}

export interface ParticipantTableState {
  globalFilter: string;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  onGlobalFilterChange: OnChangeFn<string>;
  onSortingChange: OnChangeFn<SortingState>;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  total: number;
  page: number;
  take: number;
  busy: boolean;
  selection?: ParticipantSelection;
}
interface UseParticipantTableProps {
  serverState?: ParticipantTableState;
  data: FlattenedParticipant[];
  attributes: Attribute[];
  blocks: (Block | null)[] | null;
  eventUuid: string;
  onUpdateData: (rowIndex: number, value: FlattenedParticipant) => void;
}

export function useParticipantsTable({
  data,
  attributes,
  blocks,
  onUpdateData,
  eventUuid,
  serverState,
}: UseParticipantTableProps) {
  const storageKey = `column-order-${eventUuid}`;
  const t = useTranslations("Table");
  const locale = useLocale();
  const { toast } = useToast();

  const [globalFilter, setGlobalFilter] = useState("");
  const [loadingRows, setLoadingRows] = useState<Record<number, boolean>>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [rowSnapshots, setRowSnapshots] = useState<
    Record<number, FlattenedParticipant>
  >({});

  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored != null) {
        setColumnOrder(JSON.parse(stored) as string[]);
      }
    } catch {
      toast({
        variant: "destructive",
        title: t("columnOrderLoadError"),
      });
    }
  }, [storageKey, t, toast]);

  const columns = useMemo(
    () => createColumns(attributes, blocks ?? [], t, locale),
    [attributes, blocks, t, locale],
  );

  const table = useReactTable<FlattenedParticipant>({
    data,
    columns,
    defaultColumn: {
      size: 150,
      minSize: 80,
      maxSize: 300,
    },
    state: {
      globalFilter: serverState?.globalFilter ?? globalFilter,
      ...(serverState == null
        ? {}
        : {
            sorting: serverState.sorting,
            columnFilters: serverState.columnFilters,
          }),
      columnOrder,
    },
    onGlobalFilterChange: serverState?.onGlobalFilterChange ?? setGlobalFilter,
    ...(serverState == null
      ? {}
      : {
          onSortingChange: serverState.onSortingChange,
          onColumnFiltersChange: serverState.onColumnFiltersChange,
        }),
    manualFiltering: serverState != null,
    manualSorting: serverState != null,
    getRowId: (row) => row.uuid,
    enableRowSelection: serverState?.busy !== true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    globalFilterFn: "includesString",
    autoResetAll: false,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    onColumnOrderChange: (updater) => {
      setColumnOrder((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },

    meta: {
      eventUuid,
      totalParticipants: serverState?.total,
      rowOffset:
        serverState == null ? 0 : (serverState.page - 1) * serverState.take,
      isBusy: serverState?.busy,
      selection: serverState?.selection,
      updateData: onUpdateData,
      isRowLoading: (rowIndex: number) => loadingRows[rowIndex],
      setRowLoading: (rowIndex: number, isLoading: boolean) => {
        setLoadingRows((previous) => ({ ...previous, [rowIndex]: isLoading }));
      },
      setRowSnapshot: (rowIndex: number, value: FlattenedParticipant) => {
        setRowSnapshots((previous) => {
          return {
            ...previous,
            [rowIndex]: cloneParticipantRow(value),
          };
        });
      },
      getRowSnapshot: (rowIndex: number) => rowSnapshots[rowIndex],
      clearRowSnapshot: (rowIndex: number) => {
        setRowSnapshots((previous) => {
          if (!(rowIndex in previous)) {
            return previous;
          }

          const { [rowIndex]: _removed, ...rest } = previous;
          return rest;
        });
      },
    },

    initialState: {
      columnVisibility: { id: false },
    },
    enableMultiSort: true,
  });

  return { table, globalFilter: serverState?.globalFilter ?? globalFilter };
}
