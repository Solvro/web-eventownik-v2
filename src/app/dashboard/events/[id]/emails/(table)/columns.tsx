"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import type { EventEmailParticipantData } from "@/types/emails";

function SortableHeader<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>;
  title: string;
}) {
  const sorting = column.getIsSorted();

  return (
    <button
      type="button"
      className="flex items-center gap-1"
      onClick={() => {
        column.toggleSorting(sorting === "asc");
      }}
    >
      <span>{title}</span>
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

export const columns: ColumnDef<EventEmailParticipantData>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column} title="Odbiorca" />,
  },
  {
    id: "date",
    accessorFn: (row) => {
      const value = format(row.meta.pivot_send_at, "dd.MM.yyyy");
      if (value === "01.01.1970") {
        return "-";
      }
      return value;
    },
    header: ({ column }) => <SortableHeader column={column} title="Data" />,
  },
  {
    id: "time",
    accessorFn: (row) => {
      const value = format(row.meta.pivot_send_at, "dd.MM.yyyy");
      if (value === "01.01.1970") {
        return "-";
      }
      return format(row.meta.pivot_send_at, "HH:mm");
    },
    header: ({ column }) => <SortableHeader column={column} title="Godzina" />,
  },
  {
    id: "status",
    accessorFn: (row) => {
      const status = row.meta.pivot_status;

      if (status === "sent") {
        return "Wysłano";
      }
      if (status === "pending") {
        return "Oczekujące";
      }
      if (status === "failed") {
        return "Nieudane";
      }

      return status;
    },
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    filterFn: (row, columnId, filterValue) => {
      const value = filterValue as string | undefined;
      if (value === undefined || value === "" || value === "all") {
        return true;
      }

      return row.original.meta.pivot_status === value;
    },
  },
];
