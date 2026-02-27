"use client";

import { flexRender } from "@tanstack/react-table";
import type { RowData, Table as TanstackTable } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Attribute } from "@/types/attributes";
import type { FlattenedParticipant } from "@/types/participant";

import { TableColumnHeader } from "../components/table-ui/table-column-header";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    attribute?: Attribute;
    name?: string;
    showInTable?: boolean;
  }

  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, value: TData) => void;
    isRowLoading: (rowIndex: number) => boolean;
    setRowLoading: (rowIndex: number, isLoading: boolean) => void;
  }
}

interface ParticipantTableProps {
  table: TanstackTable<FlattenedParticipant>;
}

export function ParticipantTable({ table }: ParticipantTableProps) {
  const t = useTranslations("Table");
  const isResizingColumn = Boolean(
    table.getState().columnSizingInfo.isResizingColumn,
  );

  useEffect(() => {
    document.body.style.cursor = isResizingColumn ? "col-resize" : "";
    document.body.style.userSelect = isResizingColumn ? "none" : "";
  }, [isResizingColumn]);

  return (
    <>
      <ScrollArea className="mt-4 w-full">
        <Table style={{ width: "100%", minWidth: table.getTotalSize() }}>
          <TableHeader className="border-border border-b-2">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableColumnHeader key={header.id} header={header} />
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                      maxWidth: cell.column.getSize(),
                    }}
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {table.getRowCount() === 0 ? (
        <div className="text-center">{t("participantsNotFound")}</div>
      ) : null}
    </>
  );
}
