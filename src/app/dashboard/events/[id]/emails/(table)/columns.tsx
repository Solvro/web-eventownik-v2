"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import type { EventEmailParticipantData } from "@/types/emails";

export const columns: ColumnDef<EventEmailParticipantData>[] = [
  {
    accessorKey: "email",
    header: "Odbiorca",
  },
  {
    accessorFn: (row) => format(row.meta.pivot_send_at, "dd.MM.yyyy"),
    header: "Data",
  },
  {
    accessorFn: (row) => format(row.meta.pivot_send_at, "HH:mm"),
    header: "Godzina",
  },
  {
    accessorFn: (row) =>
      row.meta.pivot_status === "sent" ? "Wysłano" : row.meta.pivot_status,
    header: "Status",
  },
];
