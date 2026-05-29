"use client";

import { flexRender } from "@tanstack/react-table";
import type { RowData, Table as TanstackTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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

const DEFAULT_ROW_HEIGHT = 72;

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
    setRowSnapshot: (rowIndex: number, value: TData) => void;
    getRowSnapshot: (rowIndex: number) => TData | undefined;
    clearRowSnapshot: (rowIndex: number) => void;
  }
}

interface ParticipantTableProps {
  table: TanstackTable<FlattenedParticipant>;
}

export function ParticipantTable({ table }: ParticipantTableProps) {
  const t = useTranslations("Table");
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const [resizingRowId, setResizingRowId] = useState<string | null>(null);

  const rows = table.getRowModel().rows;

  const isResizingColumn = Boolean(
    table.getState().columnSizingInfo.isResizingColumn,
  );

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    enabled: scrollElement !== null,
    getScrollElement: () => scrollElement,
    estimateSize: (index) => {
      const row = rows[index];
      return rowHeights[row.id] ?? DEFAULT_ROW_HEIGHT;
    },
    overscan: 8,
    initialRect: {
      height: 800,
      width: 1200,
    },
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();
  const topPaddingHeight = virtualRows[0]?.start ?? 0;
  const lastVirtualRow = virtualRows.at(-1);
  const bottomPaddingHeight =
    virtualRows.length > 0 ? totalHeight - (lastVirtualRow?.end ?? 0) : 0;

  useEffect(() => {
    const isResizingRow = resizingRowId !== null;

    document.body.style.cursor =
      isResizingColumn || isResizingRow
        ? isResizingColumn
          ? "col-resize"
          : "row-resize"
        : "";

    document.body.style.userSelect =
      isResizingColumn || isResizingRow ? "none" : "";
  }, [isResizingColumn, resizingRowId]);

  const handleRowResizeStart = (
    event: React.MouseEvent,
    rowId: string,
    rowIndex: number,
    currentHeight: number,
  ) => {
    event.preventDefault();

    setResizingRowId(rowId);

    const startY = event.clientY;
    const startHeight = currentHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const nextHeight = Math.max(40, startHeight + moveEvent.clientY - startY);

      setRowHeights((previous) => ({
        ...previous,
        [rowId]: nextHeight,
      }));

      rowVirtualizer.resizeItem(rowIndex, nextHeight);
    };

    const onMouseUp = () => {
      setResizingRowId(null);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col">
      <ScrollArea
        className="h-[calc(100dvh-275px)] w-full"
        viewportRef={setScrollElement}
      >
        <Table style={{ width: "100%", minWidth: table.getTotalSize() }}>
          <TableHeader className="border-border bg-background sticky top-0 z-50 border-b-2">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableColumnHeader key={header.id} header={header} />
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {virtualRows.length > 0 && topPaddingHeight > 0 ? (
              <TableRow aria-hidden="true">
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  style={{
                    height: topPaddingHeight,
                    padding: 0,
                    border: 0,
                  }}
                />
              </TableRow>
            ) : null}

            {virtualRows.length > 0
              ? virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index];

                  return (
                    <TableRow
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={
                        rowHeights[row.id]
                          ? undefined
                          : rowVirtualizer.measureElement
                      }
                      style={{
                        height: rowHeights[row.id],
                        position: "relative",
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            width: cell.column.getSize(),
                            minWidth: cell.column.getSize(),
                            maxWidth: cell.column.getSize(),
                          }}
                          className={cn(
                            "wrap-break-word whitespace-normal",
                            cell.column.id === "edit" &&
                              "sticky right-3 z-10 overflow-visible",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}

                          <div
                            aria-hidden="true"
                            className={cn(
                              "hover:bg-primary absolute bottom-0 left-0 h-0.5 w-full cursor-row-resize bg-transparent transition-colors",
                              resizingRowId === row.id
                                ? "bg-primary"
                                : "bg-transparent",
                            )}
                            onMouseDown={(event) => {
                              handleRowResizeStart(
                                event,
                                row.id,
                                virtualRow.index,
                                rowHeights[row.id] ?? virtualRow.size,
                              );
                            }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              : rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          maxWidth: cell.column.getSize(),
                        }}
                        className={cn(
                          "wrap-break-word whitespace-normal",
                          cell.column.id === "edit" &&
                            "sticky right-3 z-10 overflow-visible",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

            {virtualRows.length > 0 && bottomPaddingHeight > 0 ? (
              <TableRow aria-hidden="true">
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  style={{
                    height: bottomPaddingHeight,
                    padding: 0,
                    border: 0,
                  }}
                />
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {rows.length === 0 ? (
        <div className="text-center">{t("participantsNotFound")}</div>
      ) : null}
    </div>
  );
}
