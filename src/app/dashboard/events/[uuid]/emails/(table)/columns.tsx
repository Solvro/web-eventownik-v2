"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

import type { EventEmailParticipantData } from "@/types/emails";

import { StatusFilterButton } from "./status-filter-button";

function StatusColumnHeader({
  column,
}: {
  column: Column<EventEmailParticipantData>;
}) {
  return (
    <div className="flex items-center gap-1">
      <StatusFilterButton column={column} />
      <SortableHeader column={column} title={"statusLabel"} />
    </div>
  );
}

function SortableHeader<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>;
  title: "recipient" | "date" | "time" | "statusLabel";
}) {
  const sorting = column.getIsSorted();
  const t = useTranslations("EmailHistoryTable");

  return (
    <button
      type="button"
      className="flex items-center gap-1"
      onClick={() => {
        column.toggleSorting(sorting === "asc");
      }}
    >
      <span>{t(title)}</span>
      {sorting === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
      ) : sorting === "desc" ? (
        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <ArrowUpDown
          className="text-muted-foreground h-3.5 w-3.5"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export const getColumns = (
  t: ReturnType<typeof useTranslations>,
): ColumnDef<EventEmailParticipantData>[] => [
  {
    // The email is missing for deliveries to participants that were deleted since
    accessorFn: (row) => row.email ?? "-",
    id: "email",
    header: ({ column }) => (
      <SortableHeader column={column} title="recipient" />
    ),
  },
  {
    id: "date",
    accessorFn: (row) => format(row.sendAt, "dd.MM.yyyy"),
    header: ({ column }) => <SortableHeader column={column} title="date" />,
  },
  {
    id: "time",
    accessorFn: (row) => format(row.sendAt, "HH:mm"),
    header: ({ column }) => <SortableHeader column={column} title="time" />,
  },
  {
    id: "status",
    accessorFn: (row) => {
      return t(row.status);
    },
    header: ({ column }) => <StatusColumnHeader column={column} />,
    filterFn: (row, _columnId, filterValue) => {
      const values = filterValue as string[] | undefined;
      if (values === undefined || values.length === 0) {
        return true;
      }
      return values.includes(row.original.status);
    },
  },
];
