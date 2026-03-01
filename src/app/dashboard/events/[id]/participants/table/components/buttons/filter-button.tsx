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
import type {
  FlattenedParticipant,
  ParticipantAttributeValueType,
} from "@/types/participant";

export function FilterButton({
  attributeType,
  options_,
  column,
}: {
  attributeType: AttributeType;
  options_: (string | { label: string; value: string })[] | null;
  column: Column<FlattenedParticipant, ParticipantAttributeValueType>;
}) {
  if (
    attributeType === "checkbox" ||
    attributeType === "select" ||
    (attributeType === "multiselect" && options_ !== null)
  ) {
    let options: {
      label: string;
      value: ParticipantAttributeValueType;
    }[] =
      options_ === null
        ? []
        : options_.map((option) =>
            typeof option === "string"
              ? { label: option, value: option }
              : { label: option.label, value: option.value },
          );

    const filterValues =
      (column.getFilterValue() as
        | ParticipantAttributeValueType[]
        | undefined) ?? [];

    if (attributeType === "checkbox" && options_ === null) {
      options = [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ];
    }

    options.push({ label: "Brak", value: null });

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={filterValues.length === 0 ? "eventGhost" : "outline"}
            size="icon"
            aria-label="Otwórz menu filtrów"
          >
            <Filter strokeWidth={filterValues.length === 0 ? 2 : 3} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options.map(({ label, value }) => {
            return (
              <DropdownMenuCheckboxItem
                key={value === null ? "__null__" : label}
                onSelect={(event) => {
                  event.preventDefault();
                }}
                checked={filterValues.includes(value)}
                onCheckedChange={(checked) => {
                  const newFilterValues = checked
                    ? [...filterValues, value]
                    : filterValues.filter((_value) => _value !== value);
                  column.setFilterValue(
                    newFilterValues.length > 0 ? newFilterValues : [],
                  );
                }}
              >
                {label}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return null;
}
