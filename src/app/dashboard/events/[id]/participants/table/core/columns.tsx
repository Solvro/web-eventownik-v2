import type { Row } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type {
  FlattenedParticipant,
  ParticipantAttributeValueType,
} from "@/types/participant";

import { EditParticipantButton } from "../components/buttons/edit-button";
import { FilterButton } from "../components/buttons/filter-button";
import { EditableCell } from "../components/table-ui/editable-cell";
import { SortHeader } from "../components/table-ui/sort-header";

const columnHelper = createColumnHelper<FlattenedParticipant>();

const BASE_COLUMNS = [
  columnHelper.display({
    id: "select",
    size: 40,
    minSize: 40,
    maxSize: 40,
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
    enableResizing: false,
  }),
  columnHelper.display({
    id: "no",
    size: 52,
    minSize: 52,
    maxSize: 52,
    header: "No.",
    cell: ({ row }) => {
      return row.index + 1;
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  }),
  columnHelper.accessor("email", {
    size: 200,
    minSize: 120,
    maxSize: 300,
    meta: { name: "Email" },
    header: (info) => <SortHeader info={info} name="Email" />,
    cell: (info) => <EditableCell info={info} />,
  }),
  columnHelper.accessor("createdAt", {
    size: 160,
    minSize: 100,
    maxSize: 240,
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
        },
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
        header: (info) => (
          <div className="flex items-center gap-1">
            <FilterButton
              attributeType={attribute.type}
              options_={attribute.options}
              column={info.column}
            />
            <SortHeader info={info} name={attribute.name} truncate />
          </div>
        ),
        cell: (info) => (
          <EditableCell info={info} attribute={attribute} blocks={blocks} />
        ),
      }),
    );

  const editColumn = columnHelper.display({
    id: "edit",
    cell: ({ row, table }) => <EditParticipantButton row={row} table={table} />,
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  });

  return [...BASE_COLUMNS, ...attributeColumns, editColumn];
}
