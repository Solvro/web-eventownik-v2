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

type EmailStatus = "sent" | "pending" | "failed";

export const getColumns = (
  t: ReturnType<typeof useTranslations>,
): ColumnDef<EventEmailParticipantData>[] => [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <SortableHeader column={column} title="recipient" />
    ),
  },
  {
    id: "date",
    accessorFn: (row) => {
      const value = format(row.meta.pivot_send_at, "dd.MM.yyyy");

      if (row.meta.pivot_status === "pending" && value === "01.01.1970") {
        return "-";
      }
      return value;
    },
    header: ({ column }) => <SortableHeader column={column} title="date" />,
  },
  {
    id: "time",
    accessorFn: (row) => {
      const value = format(row.meta.pivot_send_at, "dd.MM.yyyy");

      if (row.meta.pivot_status === "pending" && value === "01.01.1970") {
        return "-";
      }

      return format(row.meta.pivot_send_at, "HH:mm");
    },
    header: ({ column }) => <SortableHeader column={column} title="time" />,
  },
  {
    id: "status",
    accessorFn: (row) => {
      return t(row.meta.pivot_status as EmailStatus);
    },
    header: ({ column }) => <StatusColumnHeader column={column} />,
    filterFn: (row, _columnId, filterValue) => {
      const values = filterValue as string[] | undefined;
      if (values === undefined || values.length === 0) {
        return true;
      }
      return values.includes(row.original.meta.pivot_status);
    },
  },
];
