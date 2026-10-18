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
  VisibilityState,
} from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState } from "react";

import { defaultColumnVisibility } from "@/app/dashboard/events/[uuid]/participants/query";
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

/**
 * Controlled view state. Search, sorting and filters are still applied by the
 * table itself (client-side), because the backend listing cannot do them.
 */
export interface ParticipantTableState {
  globalFilter: string;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  onGlobalFilterChange: OnChangeFn<string>;
  onSortingChange: OnChangeFn<SortingState>;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  onColumnVisibilityChange: OnChangeFn<VisibilityState>;
  /** Total participants on the server, when no search or filter narrows it down. */
  total?: number;
  /** Whether every server page is loaded into a consistent snapshot. */
  isComplete: boolean;
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
  const [visibilityOverrides, setVisibilityOverrides] =
    useState<VisibilityState>({});
  const columnVisibility = serverState?.columnVisibility ?? {
    ...defaultColumnVisibility(attributes),
    ...visibilityOverrides,
  };
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
      columnVisibility,
    },
    onGlobalFilterChange: serverState?.onGlobalFilterChange ?? setGlobalFilter,
    ...(serverState == null
      ? {}
      : {
          onSortingChange: serverState.onSortingChange,
          onColumnFiltersChange: serverState.onColumnFiltersChange,
        }),
    onColumnVisibilityChange:
      serverState?.onColumnVisibilityChange ??
      ((updater) => {
        setVisibilityOverrides(
          typeof updater === "function" ? updater(columnVisibility) : updater,
        );
      }),
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
      isListComplete: serverState?.isComplete ?? true,
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

    enableMultiSort: true,
  });

  return { table, globalFilter: serverState?.globalFilter ?? globalFilter };
}
