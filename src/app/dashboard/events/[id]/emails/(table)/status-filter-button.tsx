"use client";

import type { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EMAIL_HISTORY_STATUS_FILTER_VALUES } from "@/lib/emails";
import type { EventEmailParticipantData } from "@/types/emails";

function StatusFilterButton({
  column,
}: {
  column: Column<EventEmailParticipantData>;
}) {
  const t = useTranslations("EmailHistoryTable");
  const filterValues = (column.getFilterValue() as string[] | undefined) ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={filterValues.length === 0 ? "eventGhost" : "outline"}
          size="icon"
          aria-label={t("openFilterMenu")}
        >
          <Filter strokeWidth={filterValues.length === 0 ? 2 : 3} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {EMAIL_HISTORY_STATUS_FILTER_VALUES.map((value) => (
          <DropdownMenuCheckboxItem
            key={value}
            onSelect={(event) => {
              event.preventDefault();
            }}
            checked={filterValues.includes(value)}
            onCheckedChange={(checked) => {
              const newFilterValues = checked
                ? [...filterValues, value]
                : filterValues.filter((v) => v !== value);
              column.setFilterValue(
                newFilterValues.length > 0 ? newFilterValues : undefined,
              );
            }}
          >
            {t(value)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { StatusFilterButton };
