import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { generateColumns } from "@/app/dashboard/events/[id]/participants/table/columns";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { FlattenedParticipant } from "@/types/participant";

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
  onUpdateData,
  eventId,
}: UseParticipantTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [loadingRows, setLoadingRows] = useState<Record<number, boolean>>({});

  const columns = useMemo(
    () => generateColumns(attributes, blocks ?? [], eventId),
    [attributes, blocks, eventId],
  );

  const table = useReactTable<FlattenedParticipant>({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    globalFilterFn: "includesString",

    meta: {
      updateData: onUpdateData,
      isRowLoading: (rowIndex: number) => loadingRows[rowIndex],
      setRowLoading: (rowIndex: number, isLoading: boolean) => {
        setLoadingRows((previous) => ({ ...previous, [rowIndex]: isLoading }));
      },
    },

    initialState: {
      pagination: { pageSize: 25, pageIndex: 0 },
      columnVisibility: { id: false },
    },
    autoResetPageIndex: false,
    enableMultiSort: true,
  });

  return { table, globalFilter };
}
