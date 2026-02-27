import type { Header } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { getAriaSort } from "../../core/utils";

interface TableHeaderProps<TData> {
  header: Header<TData, unknown>;
}

export function TableColumnHeader<TData>({ header }: TableHeaderProps<TData>) {
  const isResizing = header.column.getIsResizing();

  return (
    <TableHead
      style={{
        width: header.getSize(),
        maxWidth: header.getSize(),
        minWidth: header.getSize(),
      }}
      className={
        "border-border bg-background relative border-r-2 last:border-0"
      }
      aria-sort={getAriaSort(header.column.getIsSorted())}
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
      {header.column.getCanResize() && (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          id="resize_"
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "absolute top-0 -right-1 h-full w-1 cursor-col-resize touch-none select-none",
            isResizing ? "bg-primary" : "hover:bg-primary",
          )}
        />
      )}
    </TableHead>
  );
}
