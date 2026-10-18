import type { Row } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import type { useTranslations as UseTranslations } from "next-intl";

import { ClientFormattedDate } from "@/components/client-formatted-date";
import { Checkbox } from "@/components/ui/checkbox";
import { attributeOptions } from "@/lib/attribute-config";
import { multiValues } from "@/lib/multi-values";
import { getAttributeLabel } from "@/lib/utils";
import type { Block } from "@/types/blocks";
import type {
  FlattenedParticipant,
  ParticipantAttributeValueType,
} from "@/types/participant";
import type { V3Attribute as Attribute } from "@/types/v3";

import { EditParticipantButton } from "../components/buttons/edit-button";
import { FilterButton } from "../components/buttons/filter-button";
import { EditableCell } from "../components/table-ui/editable-cell";
import { SortHeader } from "../components/table-ui/sort-header";

const columnHelper = createColumnHelper<FlattenedParticipant>();

type TableTranslator = ReturnType<typeof UseTranslations<"Table">>;

function getBaseColumns(t: TableTranslator) {
  return [
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
            table.options.meta?.selection?.onClear();
            table.toggleAllPageRowsSelected(Boolean(value));
          }}
          aria-label={
            table.options.meta?.isListComplete === false
              ? t("selectLoadedRows", {
                  count: table.getRowModel().rows.length,
                  total:
                    table.options.meta.totalParticipants ??
                    table.getRowModel().rows.length,
                })
              : t("selectAllRows", { count: table.getRowModel().rows.length })
          }
          disabled={table.options.meta?.isBusy === true}
        />
      ),
      cell: ({ row, table }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            table.options.meta?.selection?.onClear();
            row.toggleSelected(Boolean(value));
          }}
          aria-label={t("selectRow")}
          disabled={table.options.meta?.isBusy === true}
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
      header: t("rowNumberTitle"),
      // Number by displayed position: `row.index` is the position in the
      // unsorted data, which differs once rows are sorted client-side.
      cell: ({ row, table }) =>
        table.getRowModel().rows.findIndex((item) => item.id === row.id) + 1,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
    }),
    columnHelper.accessor("email", {
      size: 200,
      minSize: 120,
      maxSize: 300,
      meta: { name: t("columnEmailTitle") },
      header: (info) => <SortHeader info={info} name={t("columnEmailTitle")} />,
      cell: (info) => <EditableCell info={info} />,
    }),
    columnHelper.accessor("createdAt", {
      size: 160,
      minSize: 160,
      maxSize: 240,
      meta: { name: t("columnCreatedAtTitle") },
      header: (info) => (
        <SortHeader info={info} name={t("columnCreatedAtTitle")} />
      ),
      cell: (info) => (
        <ClientFormattedDate
          date={info.getValue()}
          formatStr="yyyy-MM-dd HH:mm:ss"
        />
      ),
    }),
  ];
}

export function createColumns(
  attributes: Attribute[],
  blocks: (Block | null)[],
  t: TableTranslator,
  locale: string,
) {
  // Every attribute gets a column; `showInList` only sets its default visibility.
  const attributeColumns = attributes.map((attribute) =>
    columnHelper.accessor(attribute.uuid, {
      meta: {
        attribute,
        name: attribute.name,
        showInTable: attribute.showInList,
      },
      ...(["multiSelect", "block"].includes(attribute.type)
        ? { minSize: 240 }
        : {}),
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
        if (rowValue !== null && attribute.type === "multiSelect") {
          const values = new Set(multiValues(String(row.original[columnId])));
          return filterValue.some((value) => values.has(value as string));
        }

        // Special case when attribute of single select type is set empty
        // Check implementation of AttributeInput for explanation
        if (rowValue === " " && filterValue.includes(null)) {
          return true;
        }

        return (
          filterValue.includes(rowValue) ||
          (attribute.type === "checkbox" &&
            filterValue.some((value) => String(value) === String(rowValue)))
        );
      },
      header: (info) => (
        <div className="flex items-center gap-1">
          <FilterButton
            attributeType={attribute.type}
            options_={attributeOptions(attribute)}
            blocks={blocks}
            column={info.column}
            attributeUuid={attribute.uuid}
          />
          <div className="min-w-0 flex-1">
            <SortHeader
              info={info}
              name={getAttributeLabel(attribute.name, locale)}
              truncate
            />
          </div>
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

  return [...getBaseColumns(t), ...attributeColumns, editColumn];
}
