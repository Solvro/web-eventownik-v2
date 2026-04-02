"use client";

import { flexRender } from "@tanstack/react-table";
import type { RowData, Table as TanstackTable } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
    eventId: string;
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
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { pageIndex, pageSize } = table.getState().pagination;
  const globalFilter = table.getState().globalFilter as string;
  const sortingString = JSON.stringify(table.getState().sorting);

  const isResizingColumn = Boolean(
    table.getState().columnSizingInfo.isResizingColumn,
  );

  useEffect(() => {
    table.setPageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter, sortingString]);

  const allRows = table.getPrePaginationRowModel().rows;
  const visibleRows = allRows.slice(0, (pageIndex + 1) * pageSize);
  const hasMore = visibleRows.length < allRows.length;

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && table.getCanNextPage()) {
        table.nextPage();
      }
    },
    [table],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel === null) {
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [handleIntersection]);

  useEffect(() => {
    document.body.style.cursor = isResizingColumn ? "col-resize" : "";
    document.body.style.userSelect = isResizingColumn ? "none" : "";
  }, [isResizingColumn]);

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col">
      <ScrollArea className="h-[calc(100dvh-275px)] w-full">
        <Table style={{ width: "100%", minWidth: table.getTotalSize() }}>
          <TableHeader className="border-border bg-background sticky top-0 z-10 border-b-2">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableColumnHeader key={header.id} header={header} />
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow key={row.id} className="h-18">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                      maxWidth: cell.column.getSize(),
                    }}
                    className={cn(
                      "overflow-hidden text-ellipsis whitespace-nowrap",
                      cell.column.id === "edit" &&
                        "sticky right-3 z-20 overflow-visible",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {hasMore ? (
          <div
            ref={sentinelRef}
            className="text-muted-foreground flex h-10 items-center justify-center text-sm"
          >
            {t("loadingMore")}
          </div>
        ) : (
          <div ref={sentinelRef} />
        )}

        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      {allRows.length === 0 ? (
        <div className="text-center">{t("participantsNotFound")}</div>
      ) : null}
    </div>
  );
}
