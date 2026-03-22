"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { BlockParticipant } from "@/types/blocks";

export const columns: ColumnDef<BlockParticipant>[] = [
  {
    accessorKey: "name",
    header: "Identyfikator uczestnika",
  },
  {
    accessorKey: "email",
    header: "Email uczestnika",
  },
];
