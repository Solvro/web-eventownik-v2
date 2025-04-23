"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { Participant } from "@/types/participant";

export const columns: ColumnDef<Participant>[] = [
  {
    accessorKey: "email",
    header: "Email uczestnika",
  },
];
