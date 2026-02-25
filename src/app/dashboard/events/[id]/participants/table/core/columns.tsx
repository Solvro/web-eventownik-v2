import { createColumnHelper } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { FlattenedParticipant } from "@/types/participant";

import { FilterButton } from "../components/buttons/filter-button";
import { SortHeader } from "../components/table-ui/sort-header";
import { formatAttributeValue } from "./utils";

const columnHelper = createColumnHelper<FlattenedParticipant>();

const BASE_COLUMNS = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => {
          table.toggleAllPageRowsSelected(Boolean(value));
        }}
        aria-label="Wybierz wszystkie na stronie"
      />
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
  }),
  columnHelper.display({
    id: "no",
    header: "No.",
    cell: ({ row }) => {
      return row.index + 1;
    },
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("email", {
    meta: { name: "Email" },
    header: (info) => <SortHeader info={info} name="Email" />,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("createdAt", {
    meta: { name: "Data rejestracji" },
    header: (info) => <SortHeader info={info} name="Data rejestracji" />,
    cell: (info) => info.getValue(),
  }),
];

export function createColumns(
  attributes: Attribute[],
  blocks: (Block | null)[],
) {
  const attributeColumns = attributes
    .filter((attribute) => attribute.showInList)
    .map((attribute) =>
      columnHelper.accessor(attribute.id.toString(), {
        meta: {
          attribute,
          name: attribute.name,
          showInTable: attribute.showInList,
          headerClassName: attribute.showInList ? "" : "hidden",
          cellClassName: attribute.showInList ? "" : "hidden",
        },
        header: (info) => (
          <div className="flex items-center gap-1">
            <FilterButton
              attributeType={attribute.type}
              options_={attribute.options}
              blocks={blocks}
              column={info.column}
              attributeId={attribute.id}
            />
            <SortHeader info={info} name={attribute.name} truncate />
          </div>
        ),
        cell: (info) =>
          formatAttributeValue(
            info.getValue(),
            attribute.type,
            attribute.id,
            blocks,
          ),
      }),
    );

  const editColumn = columnHelper.display({
    id: "edit",
    enableSorting: false,
    enableHiding: false,
  });

  return [...BASE_COLUMNS, ...attributeColumns, editColumn];
}
