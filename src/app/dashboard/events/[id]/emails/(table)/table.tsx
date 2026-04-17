"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { flexRender } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SingleEventEmail } from "@/types/emails";

import { columns } from "./columns";
import { EmailHistoryToolbar } from "./email-history-toolbar";
import { useEmailHistoryTable } from "./use-email-history-table";

function getAriaSort(
  sortDirection: "asc" | "desc" | false,
): "none" | "ascending" | "descending" | undefined {
  if (sortDirection === false) {
    return "none";
  }
  if (sortDirection === "asc") {
    return "ascending";
  }
  return "descending";
}

function EmailHistoryTable({ email }: { email: SingleEventEmail }) {
  const t = useTranslations("EmailHistoryTable");
  const { table, globalFilter } = useEmailHistoryTable(email);
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <EmailHistoryToolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={(value) => {
          table.setGlobalFilter(value);
        }}
        onResetFilters={() => {
          table.resetColumnFilters();
        }}
        onResetSorting={() => {
          table.resetSorting();
        }}
      />

      <ScrollAreaPrimitive.Root
        data-slot="scroll-area"
        className="border-border bg-background relative min-h-0 flex-1 rounded-md border"
      >
        <ScrollAreaPrimitive.Viewport
          data-slot="scroll-area-viewport"
          className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
        >
          <Table className="min-w-[640px] sm:min-w-0">
            <TableHeader className="border-border border-b-2">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sortDirection = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        className="border-border bg-background border-r-2 px-2 py-2 text-xs sm:px-3 sm:py-2 sm:text-sm"
                        aria-sort={getAriaSort(sortDirection)}
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
                    colSpan={columns.length}
                    className="text-muted-foreground h-24 px-2 text-center text-xs sm:px-3 sm:text-sm"
                  >
                    Brak wyników
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
        <ScrollBar orientation="horizontal" />
      </ScrollAreaPrimitive.Root>

      <p
        className="text-muted-foreground shrink-0 border-t pt-2 text-sm"
        aria-live="polite"
      >
        {t("recipientsCount", { count: filteredCount })}
      </p>
    </div>
  );
}

export { EmailHistoryTable };
