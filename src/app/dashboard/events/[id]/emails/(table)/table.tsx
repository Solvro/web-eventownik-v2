"use client";

import { flexRender } from "@tanstack/react-table";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  const { table, globalFilter, statusFilter, setStatusFilter } =
    useEmailHistoryTable(email);

  const statusColumn = table.getColumn("status");

  return (
    <div className="flex flex-col gap-4">
      <EmailHistoryToolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={(value) => {
          table.setGlobalFilter(value);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          statusColumn?.setFilterValue(value === "all" ? undefined : value);
        }}
        onResetFilters={() => {
          table.resetColumnFilters();
          setStatusFilter("all");
        }}
        onResetSorting={() => {
          table.resetSorting();
        }}
      />

      <ScrollArea className="max-h-[60vh] min-w-0 flex-1">
        <div className="relative">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sortDirection = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
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
                      <TableCell key={cell.id}>
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
                    className="text-muted-foreground h-24 text-center"
                  >
                    Brak wyników
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

export { EmailHistoryTable };
