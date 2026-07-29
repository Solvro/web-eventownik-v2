/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
/* eslint-disable unicorn/switch-case-braces */
import type { SortDirection } from "@tanstack/react-table";
import { format } from "date-fns";

import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { ParticipantAttributeValueType } from "@/types/participant";

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
    case "date":
      return format(new Date(value as string | number | Date), "dd-MM-yyyy");
    case "datetime":
      return format(
        new Date(value as string | number | Date),
        "dd-MM-yyyy HH:mm:ss",
      );
    case "block": {
      const rootBlock = blocks.find((b) => b?.attributeUuid === attributeUuid);

      if (
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        rootBlock !== null &&
        rootBlock !== undefined &&
        rootBlock.attribute.isMultiple
      ) {
        const ids = (value as string).split(",").filter(Boolean);
        return ids
          .map((id) => rootBlock.children.find((b) => b.uuid === id)?.name)
          .filter(Boolean)
          .join(", ");
      }

      return (
        rootBlock?.children.find((b) => {
          return b.uuid === value;
        })?.name ?? value
      );
    }
    default:
      return value;
  }
}
