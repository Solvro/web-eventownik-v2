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
import type { Block } from "@/types/blocks";
import type {
  FlattenedParticipant,
  ParticipantAttributeValueType,
} from "@/types/participant";

export function FilterButton({
  attributeType,
  options_,
  column,
  blocks,
  attributeId,
}: {
  attributeType: AttributeType;
  options_: string[] | null;
  column: Column<FlattenedParticipant, ParticipantAttributeValueType>;
  blocks: (Block | null)[] | null;
  attributeId: number;
}) {
  if (
    attributeType === "checkbox" ||
    attributeType === "select" ||
    (attributeType === "multiselect" && options_ !== null) ||
    attributeType === "block"
  ) {
    let options: {
      label: string;
      value: ParticipantAttributeValueType;
    }[] =
      options_ === null
        ? []
        : options_.map((option) => ({
            label: option,
            value: option,
          }));

    if (attributeType === "checkbox" && options_ === null) {
      options = [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ];
    }

    if (attributeType === "block") {
      const rootBlock = blocks?.find((b) => b?.attributeId === attributeId);
      options =
        rootBlock?.children.map((block) => ({
          label: block.name,
          value: block.id.toString(),
        })) ?? [];
    }

    const filterValues =
      (column.getFilterValue() as
        | ParticipantAttributeValueType[]
        | undefined) ?? [];

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
                // Setting key to " " when filter value is null prevents from adding reserved keywords for end users
                key={value === null ? " " : label}
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
