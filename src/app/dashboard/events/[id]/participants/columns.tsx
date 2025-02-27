import { createColumnHelper } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import type { Attribute } from "@/types/attributes";
import type { FlattenedParticipant } from "@/types/participant";

export function generateColumns(attributes: Attribute[]) {
  const columnHelper = createColumnHelper<FlattenedParticipant>();
  const baseColumns = [
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
      header: "Email",
      cell: (info) => info.getValue(),
    }),
  ];

  const attributeColumns = attributes
    .filter((attribute) => attribute.showInList)
    .map((attribute) => {
      //accessor must match keys in flatParticipant (check ./data.ts)
      return columnHelper.accessor(attribute.id.toString(), {
        header: attribute.name,
        //TODO generate UI based on type of attribute
        cell: (info) => info.getValue(),
      });
    });

  return [...baseColumns, ...attributeColumns];
}
