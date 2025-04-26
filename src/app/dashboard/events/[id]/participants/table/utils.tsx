import type { Column, SortDirection, Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Filter } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AttributeType } from "@/types/attributes";
import type { FlattenedParticipant } from "@/types/participant";

export function SortButton({
  sortingDirection,
  column,
  children,
  className,
}: {
  sortingDirection: false | SortDirection;
  column: Column<
    FlattenedParticipant,
    string | number | boolean | Date | null | undefined
  >;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      className={className}
      onClick={() => {
        column.toggleSorting(sortingDirection === "asc");
      }}
    >
      {children}
    </Button>
  );
}

export function SortIcon({
  sortingDirection,
}: {
  sortingDirection: false | SortDirection;
}) {
  if (sortingDirection === false) {
    return null;
  }
  if (sortingDirection === "desc") {
    return <ArrowDown />;
  }
  return <ArrowUp />;
}

export function FilterButton({
  attributeType,
  options,
  column,
}: {
  attributeType: AttributeType;
  options: string[] | null;
  column: Column<
    FlattenedParticipant,
    string | number | boolean | Date | null | undefined
  >;
}) {
  if (
    attributeType === "checkbox" ||
    (attributeType === "select" && options !== null)
  ) {
    const filterValues =
      (column.getFilterValue() as string[] | undefined) ?? [];

    if (attributeType === "checkbox" && options === null) {
      options = ["true", "false"];
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={filterValues.length === 0 ? "ghost" : "outline"}
            size="icon"
          >
            <Filter strokeWidth={filterValues.length === 0 ? 2 : 3} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options?.map((option) => {
            return (
              <DropdownMenuCheckboxItem
                key={option}
                onSelect={(event) => {
                  event.preventDefault();
                }}
                checked={filterValues.includes(option)}
                onCheckedChange={(checked) => {
                  const newFilterValues = checked
                    ? [...filterValues, option]
                    : filterValues.filter((value) => value !== option);
                  column.setFilterValue(
                    newFilterValues.length > 0 ? newFilterValues : [],
                  );
                }}
              >
                {option}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return null;
}

export function getPaginationInfoText(table: Table<FlattenedParticipant>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  return `${
    table.getPaginationRowModel().rows.length === 0
      ? "0"
      : (pageIndex * pageSize + 1).toString()
  }-${Math.min(pageSize * pageIndex + pageSize, table.getRowCount()).toString()} z ${table.getRowCount().toString()}`;
}
