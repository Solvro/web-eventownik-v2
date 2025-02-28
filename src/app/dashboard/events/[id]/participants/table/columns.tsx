import type { Column, RowData, SortDirection } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  Filter,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Attribute, AttributeType } from "@/types/attributes";
import type { FlattenedParticipant } from "@/types/participant";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    attribute: Attribute;
  }
}

export function generateColumns(attributes: Attribute[]) {
  const columnHelper = createColumnHelper<FlattenedParticipant>();
  const baseColumns = [
    // columnHelper.accessor("id", {}),
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!(value as boolean));
          }}
          aria-label="Wybierz wszystkie"
        ></Checkbox>
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!(value as boolean));
          }}
          aria-label="Wybierz wiersz"
        ></Checkbox>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => {
        const sortingDirection = column.getIsSorted();
        return (
          <div className="flex items-center">
            <SortButton sortingDirection={sortingDirection} column={column}>
              Email
            </SortButton>
            <SortIcon sortingDirection={sortingDirection} />
          </div>
        );
      },
      cell: (info) => info.getValue(),
    }),
  ];

  const attributeColumns = [
    ...attributes
      .filter((attribute) => attribute.showInList)
      .map((attribute) => {
        //accessor must match keys in flatParticipant (check ./data.ts)
        return columnHelper.accessor(attribute.id.toString(), {
          meta: { attribute },
          header: ({ column }) => {
            const sortingDirection = column.getIsSorted();
            return (
              <div className="flex items-center">
                <FilterButton
                  attributeType={attribute.type}
                  options={attribute.options}
                  column={column}
                />
                <SortButton sortingDirection={sortingDirection} column={column}>
                  {attribute.name}
                </SortButton>
                <SortIcon sortingDirection={sortingDirection} />
              </div>
            );
          },
          cell: (info) => info.getValue(),

          filterFn: "arrIncludesSome",
        });
      }),
    columnHelper.display({
      id: "expand",
      header: ({ table }) => {
        const isAnyExpanded = table.getIsSomeRowsExpanded();
        return (
          <Button
            variant="ghost"
            onClick={() => {
              isAnyExpanded
                ? table.resetExpanded(isAnyExpanded)
                : table.toggleAllRowsExpanded();
            }}
          >
            {isAnyExpanded ? "Zwiń" : "Rozwiń"}
          </Button>
        );
      },
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              row.toggleExpanded();
            }}
          >
            {row.getIsExpanded() ? <ChevronLeft /> : <ChevronDown />}
          </Button>
        ) : null;
      },
    }),
  ];

  return [...baseColumns, ...attributeColumns];
}

function SortButton({
  sortingDirection,
  column,
  children,
}: {
  sortingDirection: false | SortDirection;
  column: Column<FlattenedParticipant, string | number | boolean | Date | null>;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => {
        column.toggleSorting(sortingDirection === "asc");
      }}
    >
      {children}
    </Button>
  );
}

function SortIcon({
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

function FilterButton({
  attributeType,
  options,
  column,
}: {
  attributeType: AttributeType;
  options: string[] | null;
  column: Column<FlattenedParticipant, string | number | boolean | Date | null>;
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
