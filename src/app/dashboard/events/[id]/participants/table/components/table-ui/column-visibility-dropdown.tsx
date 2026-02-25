/* eslint-disable unicorn/prevent-abbreviations */
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import type { FlattenedParticipant } from "@/types/participant";

interface ColumnVisibilityDropdownProps {
  table: Table<FlattenedParticipant>;
}

export function ColumnVisibilityDropdown({
  table,
}: ColumnVisibilityDropdownProps) {
  const t = useTranslations("Table");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"}>{t("columnSelectionDropdownTitle")}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => {
                column.toggleVisibility(value);
              }}
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              {column.columnDef.meta?.name ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
