import type { Row, RowData } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";

import { Checkbox } from "@/components/ui/checkbox";
import { getAttributeLabel } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type {
  FlattenedParticipant,
  ParticipantAttributeValueType,
} from "@/types/participant";

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
) {
  const columnHelper = createColumnHelper<FlattenedParticipant>();
  const baseColumns = [
    columnHelper.display({
      id: "select",
      header: ({ table }) => {
        const pageRows = table.getPaginationRowModel().rows;
        const allSelectedOnPage =
          pageRows.length > 0 && pageRows.every((r) => r.getIsSelected());
        const someSelectedOnPage = pageRows.some((r) => r.getIsSelected());
        const hasAnySelection =
          table.getIsSomeRowsSelected() || table.getIsAllRowsSelected();
        return (
          <Checkbox
            checked={
              allSelectedOnPage || (someSelectedOnPage && "indeterminate")
            }
            onCheckedChange={(value) => {
              const shouldSelect = Boolean(value);
              if (!shouldSelect && hasAnySelection) {
                table.toggleAllRowsSelected(false);
              } else {
                for (const r of pageRows) {
                  r.toggleSelected(shouldSelect);
                }
              }
            }}
            aria-label="Wybierz wszystkie na stronie"
          ></Checkbox>
        );
      },
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

  const attributeColumns = attributes
    .toSorted((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    })
    .map((attribute) => {
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
            case "drawing":
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
    });

  return [...baseColumns, ...attributeColumns];
}
