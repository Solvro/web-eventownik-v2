import type { Column, Row, Table } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";

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
import { ExpandRowCell } from "./expand-row-cell";
import { FilterButton } from "./filter-button";
import { SortButton, SortIcon } from "./sort-button";
import { formatAttributeValue } from "./utils";

export function generateColumns(
  attributes: Attribute[],
  blocks: (Block | null)[],
  eventId: string,
) {
  const columnHelper = createColumnHelper<FlattenedParticipant>();

  const baseColumns = [
    columnHelper.display({
      id: "select",
      header: ({ table }) => {
        const isAllSelected = table.getIsAllPageRowsSelected();
        const isSomeSelected = table.getIsSomePageRowsSelected();

        return (
          <Checkbox
            checked={isAllSelected || (isSomeSelected && "indeterminate")}
            onCheckedChange={(value) => {
              const shouldSelect = Boolean(value);
              if (
                !shouldSelect &&
                (table.getIsSomeRowsSelected() || table.getIsAllRowsSelected())
              ) {
                table.toggleAllRowsSelected(false);
              } else {
                table.toggleAllPageRowsSelected(shouldSelect);
              }
            }}
            aria-label="Wybierz wszystkie na stronie"
          />
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
      header: ({ column }) => <HeaderWithSort column={column} title="Email" />,
      meta: {
        showInTable: true,
      },
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <HeaderWithSort column={column} title="Data rejestracji" />
      ),
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
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <FilterButton
              attributeType={attribute.type}
              options_={attribute.options}
              column={column}
            />
            <HeaderWithSort
              column={column}
              title={getAttributeLabel(attribute.name, "pl")}
              truncate
            />
          </div>
        ),
        cell: (info) =>
          formatAttributeValue(
            info.getValue(),
            attribute.type,
            attribute.id,
            blocks,
          ),
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

  const expandColumn = columnHelper.display({
    id: "expand",
    // TODO: wait for backend for better/different implementation of fetching additional data
    // header: ({ table }) => <ExpandAllHeader table={table} eventId={eventId} />,
    cell: ({ row, table }) => (
      <ExpandRowCell row={row} table={table} eventId={eventId} />
    ),
    meta: {
      showInTable: true,
    },
  });

  return [...baseColumns, ...attributeColumns, expandColumn];
}

interface HeaderWithSortProps {
  column: Column<FlattenedParticipant, string | ParticipantAttributeValueType>;
  title: string;
  truncate?: boolean;
}

function HeaderWithSort({ column, title, truncate }: HeaderWithSortProps) {
  const sortingDirection = column.getIsSorted();

  return (
    <div className="flex items-center gap-1">
      <SortButton column={column}>
        <span className={(truncate ?? false) ? "max-w-37.5 truncate" : ""}>
          {title}
        </span>
      </SortButton>
      <SortIcon sortingDirection={sortingDirection} />
    </div>
  );
}

export async function fetchAdditionalParticipantData(
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
