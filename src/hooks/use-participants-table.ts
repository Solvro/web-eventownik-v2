/* eslint-disable unicorn/prevent-abbreviations */
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState } from "react";

import { createColumns } from "@/app/dashboard/events/[id]/participants/table/core/columns";
import { useToast } from "@/hooks/use-toast";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { FlattenedParticipant } from "@/types/participant";

function cloneParticipantRow(row: FlattenedParticipant): FlattenedParticipant {
  if (typeof structuredClone === "function") {
    return structuredClone(row);
  }

  return structuredClone(row);
}

interface UseParticipantTableProps {
  data: FlattenedParticipant[];
  attributes: Attribute[];
  blocks: (Block | null)[] | null;
  eventId: string;
  onUpdateData: (rowIndex: number, value: FlattenedParticipant) => void;
}

export function useParticipantsTable({
  data,
  attributes,
  blocks,
  eventId,
  onUpdateData,
}: UseParticipantTableProps) {
  const storageKey = `column-order-${eventId}`;
  const t = useTranslations("Table");
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
    () => createColumns(attributes, blocks ?? [], t),
    [attributes, blocks, t],
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
      globalFilter,
      columnOrder,
    },
    onGlobalFilterChange: setGlobalFilter,
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
      eventId,
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

  return { table, globalFilter };
}
