"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { useTranslations } from "next-intl";

import { formatAttributeValue } from "@/app/dashboard/events/[uuid]/participants/table/core/utils";
import type { Attribute } from "@/types/attributes";
import type { ParticipantAttributeValueType } from "@/types/participant";
import type { TicketParticipant, TicketScanAttribute } from "@/types/tickets";

export function formatTicketAttribute(
  attribute: TicketScanAttribute | undefined,
) {
  if (attribute === undefined) {
    return "-";
  }
  // The backend resolves block UUIDs to names
  if (attribute.type === "block") {
    const blockNames = attribute.blockNames?.join(", ") ?? "";
    return blockNames === "" ? "-" : blockNames;
  }
  const formatted = formatAttributeValue(
    attribute.value as ParticipantAttributeValueType,
    attribute.type,
    attribute.attributeUuid,
    [],
    false,
  );
  return formatted == null || formatted === "" ? "-" : String(formatted);
}

export const getColumns = (
  t: ReturnType<typeof useTranslations<"Tickets">>,
  shownAttributes: Attribute[],
): ColumnDef<TicketParticipant>[] => [
  {
    id: "email",
    accessorKey: "email",
    header: t("email"),
  },
  ...shownAttributes.map(
    (shownAttribute): ColumnDef<TicketParticipant> => ({
      id: shownAttribute.uuid,
      header: shownAttribute.name,
      accessorFn: (row) =>
        formatTicketAttribute(
          row.attributes.find(
            (attribute) => attribute.attributeUuid === shownAttribute.uuid,
          ),
        ),
    }),
  ),
  {
    id: "confirmedAt",
    header: t("checkedInAt"),
    accessorFn: (row) =>
      row.attendance.confirmedAt === null
        ? "-"
        : format(row.attendance.confirmedAt, "dd.MM.yyyy HH:mm"),
  },
];
