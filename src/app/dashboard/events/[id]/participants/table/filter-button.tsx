import type { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AttributeType } from "@/types/attributes";
import type { FlattenedParticipant } from "@/types/participant";

export function FilterButton({
  attributeType,
  options,
  column,
}: {
  attributeType: AttributeType;
  options: string[] | null;
  column: Column<
    FlattenedParticipant,
    string | number | boolean | Date | null | undefined
  >;
}) {
  if (
    attributeType === "checkbox" ||
    attributeType === "select" ||
    (attributeType === "multiselect" && options !== null)
  ) {
    const filterValues =
      (column.getFilterValue() as string[] | undefined) ?? [];

    if (attributeType === "checkbox" && options === null) {
      options = ["true", "false"];
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={filterValues.length === 0 ? "ghost" : "outline"}
            size="icon"
            aria-label="Otwórz menu filtrów"
          >
            <Filter strokeWidth={filterValues.length === 0 ? 2 : 3} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options?.map((option) => {
            return (
              <DropdownMenuCheckboxItem
                key={option}
                onSelect={(event) => {
                  event.preventDefault();
                }}
                checked={filterValues.includes(option)}
                onCheckedChange={(checked) => {
                  const newFilterValues = checked
                    ? [...filterValues, option]
                    : filterValues.filter((value) => value !== option);
                  column.setFilterValue(
                    newFilterValues.length > 0 ? newFilterValues : [],
                  );
                }}
              >
                {option}
              </DropdownMenuCheckboxItem>
            );
          })}
          {/* TODO Maybe add 'Empty' option which will filter empty values ("")  */}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return null;
}
