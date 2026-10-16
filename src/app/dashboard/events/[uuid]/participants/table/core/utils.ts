/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
/* eslint-disable unicorn/switch-case-braces */
import type { SortDirection } from "@tanstack/react-table";
import { format } from "date-fns";

import { multiValues } from "@/lib/multi-values";
import type { Block } from "@/types/blocks";
import type { ParticipantAttributeValueType } from "@/types/participant";
import type { V3Attribute as Attribute } from "@/types/v3";

export function getAriaSort(
  sortDirection: SortDirection | false,
): "none" | "ascending" | "descending" | "other" | undefined {
  if (sortDirection === false) {
    return "none";
  }
  if (sortDirection === "asc") {
    return "ascending";
  }
  return "descending";
}

export function formatAttributeValue(
  value: ParticipantAttributeValueType,
  type: Attribute["type"],
  attributeUuid: string,
  blocks: (Block | null)[],
) {
  if (value === undefined || value === null || value === "") {
    return value;
  }

  switch (type) {
    case "checkbox":
      return String(value);
    case "date":
      return format(new Date(value as string | number | Date), "dd-MM-yyyy");
    case "datetime":
      return format(
        new Date(value as string | number | Date),
        "dd-MM-yyyy HH:mm:ss",
      );
    case "block": {
      const rootBlock = blocks.find((b) => b?.attributeUuid === attributeUuid);

      if (rootBlock === null || rootBlock === undefined) {
        return value;
      }
      const ids = multiValues(String(value));
      return ids
        .map(
          (id) =>
            rootBlock.children.find((block) => block.uuid === id)?.name ?? id,
        )
        .join(", ");
    }
    case "multiSelect": {
      const items = multiValues(String(value)).filter(Boolean);
      return items.join(", ");
    }
    default:
      return value;
  }
}
