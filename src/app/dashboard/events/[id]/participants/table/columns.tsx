import type { RowData } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { ChevronDown, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Attribute } from "@/types/attributes";
import type { FlattenedParticipant } from "@/types/participant";

import { FilterButton, SortButton, SortIcon } from "./utils";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    attribute: Attribute;
  }
}

export function generateColumns(attributes: Attribute[]) {
  const columnHelper = createColumnHelper<FlattenedParticipant>();
  const baseColumns = [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllRowsSelected() ||
            (table.getIsSomeRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllRowsSelected(!!(value as boolean));
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
    columnHelper.display({
      id: "no",
      header: "L.p.",
      cell: ({ row }) => {
        return row.index + 1;
      },
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
    columnHelper.accessor("createdAt", {
      header: ({ column }) => {
        const sortingDirection = column.getIsSorted();
        return (
          <div className="flex items-center">
            <SortButton sortingDirection={sortingDirection} column={column}>
              Data registracji
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
            variant={row.getIsExpanded() ? "outline" : "ghost"}
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
