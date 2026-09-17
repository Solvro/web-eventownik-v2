"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import type {
  EventEmailParticipantData,
  SingleEventEmail,
} from "@/types/emails";

import { getColumns } from "./columns";

interface UseEmailHistoryTableResult {
  table: Table<EventEmailParticipantData>;
  globalFilter: string;
}

function useEmailHistoryTable(
  email: SingleEventEmail,
): UseEmailHistoryTableResult {
  const [globalFilter, setGlobalFilter] = useState("");

  const t = useTranslations("EmailHistoryTable");
  const columns = useMemo(() => getColumns(t), [t]);

  const table = useReactTable({
    data: email.participants,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  return {
    table,
    globalFilter,
  };
}

export { useEmailHistoryTable };
