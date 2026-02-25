"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  getAttributes,
  getBlocks,
  getEmails,
  getParticipants,
} from "./actions";
import { DataTable } from "./table/components/data-table";
import { createColumns } from "./table/core/columns";
import { flattenParticipants } from "./table/core/data";

export function ParticipantsLoader({ eventId }: { eventId: string }) {
  const t = useTranslations("Table");

  const { data: attributes, isError: isAttributesError } = useQuery({
    queryKey: ["attributes", eventId],
    queryFn: async () => getAttributes(eventId),
  });

  const { data: participants, isError: isParticipantsError } = useQuery({
    queryKey: ["participants", eventId],
    queryFn: async () => getParticipants(eventId),
    select: (data) =>
      data?.toSorted(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
  });

  const { data: _emails } = useQuery({
    queryKey: ["emails", eventId],
    queryFn: async () => getEmails(eventId),
  });

  const { data: blocks } = useQuery({
    queryKey: ["blocks", eventId, attributes],
    queryFn: async () => getBlocks(eventId, attributes ?? []),
    enabled: Boolean(attributes),
  });

  const tableColumns = useMemo(
    () => createColumns(attributes ?? [], blocks ?? []),
    [attributes, blocks],
  );

  if (
    isAttributesError ||
    isParticipantsError ||
    participants == null ||
    attributes == null
  ) {
    return <div className="text-center">{t("participantsError")}</div>;
  }

  return (
    // <ParticipantTable
    //   participants={participants}
    //   attributes={attributes}
    //   emails={emails ?? []}
    //   blocks={blocks ?? []}
    //   eventId={eventId}
    // />
    <DataTable
      columns={tableColumns}
      data={flattenParticipants(participants)}
    />
  );
}
