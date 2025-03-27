"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { EventEmailParticipantData } from "@/types/emails";

export const columns: ColumnDef<EventEmailParticipantData>[] = [
  {
    accessorKey: "email",
    header: "Odbiorca",
  },
  {
    accessorKey: "createdAt",
    header: "Data wysłania",
  },
  {
    accessorFn: (row) => row.meta.pivot_status,
    header: "Status",
  },
];
