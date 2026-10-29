"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Attribute } from "@/types/attributes";
import type { PaginationMeta } from "@/types/common";
import type { TicketParticipant } from "@/types/tickets";

import { getColumns } from "./columns";

function AttendanceTable({
  participants,
  meta,
  shownAttributes,
  onPageChange,
}: {
  participants: TicketParticipant[];
  meta: PaginationMeta;
  shownAttributes: Attribute[];
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("Tickets");
  const columns = useMemo(
    () => getColumns(t, shownAttributes),
    [t, shownAttributes],
  );

  // Paging, filtering and sorting happen on the backend
  const table = useReactTable({
    data: participants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ScrollArea
        horizontalScroll
        className="bg-background h-full min-h-0 flex-1 rounded-md border sm:h-[55dvh] sm:flex-none"
      >
        <div className="relative min-w-160 sm:min-w-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="bg-background border-r px-2 py-2 text-xs sm:px-3 sm:py-2 sm:text-sm"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-2 py-2 text-xs sm:px-3 sm:py-2 sm:text-sm"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllLeafColumns().length}
                    className="text-muted-foreground h-24 px-2 text-center text-xs sm:px-3 sm:text-sm"
                  >
                    {t("noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between gap-2 pt-2">
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {t("participantsCount", { count: meta.itemCount })}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {t("pageOf", {
              page: meta.page,
              pageCount: Math.max(meta.pageCount, 1),
            })}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("previousPage")}
            disabled={!meta.hasPreviousPage}
            onClick={() => {
              onPageChange(meta.page - 1);
            }}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("nextPage")}
            disabled={!meta.hasNextPage}
            onClick={() => {
              onPageChange(meta.page + 1);
            }}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { AttendanceTable };
