import type { Row, RowData, Table } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronDown, ChevronLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getAttributeLabel } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type {
  FlattenedParticipant,
  ParticipantAttributeValueType,
} from "@/types/participant";

import { getParticipant } from "../actions";
import { flattenParticipant } from "./data";
import { FilterButton } from "./filter-button";
import { SortButton, SortIcon } from "./sort-button";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    attribute?: Attribute;
    headerClassName?: string;
    cellClassName?: string;
    showInTable: boolean;
  }
}

export function generateColumns(
  attributes: Attribute[],
  blocks: (Block | null)[],
  eventId: string,
) {
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
            table.toggleAllRowsSelected(Boolean(value));
          }}
          aria-label="Wybierz wszystkie"
        ></Checkbox>
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(Boolean(value));
          }}
          aria-label="Wybierz wiersz"
        ></Checkbox>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        headerClassName: "min-w-[32px]",
        showInTable: true,
      },
    }),
    columnHelper.display({
      id: "no",
      header: "Lp.",
      cell: ({ row }) => {
        return row.index + 1;
      },
      enableSorting: false,
      enableHiding: false,
      meta: {
        headerClassName: "max-w-[36px]",
        showInTable: true,
      },
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => {
        const sortingDirection = column.getIsSorted();
        return (
          <div className="flex items-center">
            <SortButton column={column}>Email</SortButton>
            <SortIcon sortingDirection={sortingDirection} />
          </div>
        );
      },
      meta: {
        showInTable: true,
      },
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => {
        const sortingDirection = column.getIsSorted();
        return (
          <div className="flex items-center">
            <SortButton column={column}>Data rejestracji</SortButton>
            <SortIcon sortingDirection={sortingDirection} />
          </div>
        );
      },
      cell: (info) => info.getValue(),
      meta: {
        headerClassName: "w-fit",
        showInTable: true,
      },
    }),
  ];

  const attributeColumns = [
    ...attributes.map((attribute) => {
      //accessor must match keys in flatParticipant (check ./data.ts)
      const showInTable = attribute.showInList;
      return columnHelper.accessor(attribute.id.toString(), {
        meta: {
          attribute,
          showInTable,
          headerClassName: showInTable ? "" : "hidden",
          cellClassName: showInTable ? "" : "hidden",
        },
        header: ({ column }) => {
          const sortingDirection = column.getIsSorted();
          return (
            <div className="flex items-center">
              <FilterButton
                attributeType={attribute.type}
                options_={attribute.options}
                column={column}
              />
              <SortButton column={column}>
                <span className="max-w-sm truncate">
                  {getAttributeLabel(attribute.name, "pl")}
                </span>
              </SortButton>
              <SortIcon sortingDirection={sortingDirection} />
            </div>
          );
        },
        cell: (info) => {
          switch (attribute.type) {
            case "date": {
              const value = info.getValue();
              if (value !== undefined && value !== null && value !== "") {
                return format(value as Date, "dd-MM-yyyy");
              }
              return value;
            }
            case "datetime": {
              const value = info.getValue();
              if (value !== undefined && value !== null && value !== "") {
                return format(value as Date, "dd-MM-yyyy HH:mm:ss");
              }
              return value;
            }
            case "block": {
              const rootBlock = blocks.find(
                (b) => b?.attributeId === attribute.id,
              );
              const childBlockId = Number(info.getValue());
              const childBlock = rootBlock?.children.find(
                (b) => b.id === childBlockId,
              );
              return childBlock?.name;
            }
            case "time":
            case "number":
            case "text":
            case "select":
            case "email":
            case "textarea":
            case "color":
            case "checkbox":
            case "tel":
            case "file":
            case "multiselect":
            default: {
              return info.getValue();
            }
          }
        },
        //sortingFn: () => { } There we may implement custom logic for sorting, for example dependent on attribute type
        filterFn: (
          row: Row<FlattenedParticipant>,
          columnId: string,
          filterValue: ParticipantAttributeValueType[],
        ) => {
          if (filterValue.length === 0) {
            return true;
          }
          const rowValue = row.original[columnId] ?? null;

          // Multiselect case has to be handled separately
          // We need to unwrap multiselect value from "v1,v2" to ["v1","v2"]
          if (rowValue !== null && attribute.type === "multiselect") {
            const values = new Set(
              (row.original[columnId] as string).split(","),
            );
            return filterValue.some((value) => values.has(value as string));
          }

          // Special case when attribute of single select type is set empty
          // Check implementation of AttributeInput for explanation
          if (rowValue === " " && filterValue.includes(null)) {
            return true;
          }

          return filterValue.includes(rowValue);
        },
        sortDescFirst: false,
      });
    }),
    columnHelper.display({
      id: "expand",
      // TODO: wait for backend for better/different implementation of fetching additional data
      // header: ({ table }) => {
      //   const isAnyExpanded = table.getIsSomeRowsExpanded();
      //   const notExpandedRows = table
      //     .getCoreRowModel()
      //     .rows.filter((row) => !row.original.wasExpanded);
      //   return (
      //     <Button
      //       variant="eventGhost"
      //       onClick={async () => {
      //         await Promise.all(
      //           notExpandedRows.map(async (row) => {
      //             return fetchAdditionalParticipantData(row, table, eventId);
      //           }),
      //         );
      //         isAnyExpanded
      //           ? table.resetExpanded(isAnyExpanded)
      //           : table.toggleAllRowsExpanded();
      //       }}
      //     >
      //       {isAnyExpanded ? "Zwiń" : "Rozwiń"}
      //     </Button>
      //   );
      // },
      cell: ({ row, table }) => {
        const isLoading = table.options.meta?.isRowLoading(row.index) ?? false;
        return row.getCanExpand() ? (
          <Button
            size="icon"
            variant={row.getIsExpanded() ? "outline" : "eventGhost"}
            disabled={isLoading}
            onClick={async () => {
              await fetchAdditionalParticipantData(row, table, eventId);
              if (row.original.wasExpanded) {
                row.original.mode = "view";
              }
              row.toggleExpanded();
            }}
            aria-label={row.getIsExpanded() ? "Zwiń wiersz" : "Rozwiń wiersz"}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : row.getIsExpanded() ? (
              <ChevronDown />
            ) : (
              <ChevronLeft />
            )}
          </Button>
        ) : null;
      },
      meta: {
        showInTable: true,
      },
    }),
  ];

  return [...baseColumns, ...attributeColumns];
}

async function fetchAdditionalParticipantData(
  row: Row<FlattenedParticipant>,
  table: Table<FlattenedParticipant>,
  eventId: string,
) {
  if (!row.getIsExpanded() && !row.original.wasExpanded) {
    table.options.meta?.setRowLoading(row.index, true);
    const newParticipant = await getParticipant(
      eventId,
      row.original.id.toString(),
    );
    if (newParticipant !== null) {
      table.options.meta?.updateData(
        row.index,
        flattenParticipant(newParticipant, true),
      );
    }
    table.options.meta?.setRowLoading(row.index, false);
  }
}
