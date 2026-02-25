"use client";

import type { RowData, Table as TanstackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import type { Dispatch, SetStateAction } from "react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { FlattenedParticipant } from "@/types/participant";

import { TableRowForm } from "../components/table-ui/table-row-form";
import { getAriaSort } from "./utils";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    attribute?: Attribute;
    headerClassName?: string;
    cellClassName?: string;
    showInTable: boolean;
  }

  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, value: TData) => void;
    isRowLoading: (rowIndex: number) => boolean;
    setRowLoading: (rowIndex: number, isLoading: boolean) => void;
  }
}

interface ParticipantTableProps {
  table: TanstackTable<FlattenedParticipant>;
  eventId: string;
  setData: Dispatch<SetStateAction<FlattenedParticipant[]>>;
  deleteParticipant: (participantId: number) => Promise<void>;
  isQuerying: boolean;
  blocks: (Block | null)[];
}

export function ParticipantTable({
  table,
  eventId,
  setData,
  deleteParticipant,
  isQuerying,
  blocks,
}: ParticipantTableProps) {
  const t = useTranslations("Table");

  return (
    <>
      <ScrollArea className="mt-4 w-full">
        <div className="relative">
          <Table>
            <TableHeader className="border-border border-b-2">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  className="[&>th:last-of-type]:sticky [&>th:last-of-type]:-right-px [&>th:last-of-type>button]:backdrop-blur-lg"
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "border-border bg-background border-r-2",
                          header.id === "expand" ? "w-16 text-right" : "",
                          header.column.columnDef.meta?.headerClassName,
                        )}
                        aria-sort={getAriaSort(header.column.getIsSorted())}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <TableRowForm
                    key={row.id}
                    cells={row.getAllCells()}
                    eventId={eventId}
                    row={row}
                    setData={setData}
                    deleteParticipant={deleteParticipant}
                    isQuerying={isQuerying}
                    blocks={blocks}
                  ></TableRowForm>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {table.getRowCount() === 0 ? (
        <div className="text-center">{t("participantsNotFound")}</div>
      ) : null}
    </>
  );
}
