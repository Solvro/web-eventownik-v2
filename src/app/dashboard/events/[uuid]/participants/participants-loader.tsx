"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import {
  getAttributes,
  getBlocks,
  getEmails,
  getParticipants,
} from "./actions";
import { ParticipantTable } from "./table/participants-table";

export function ParticipantsLoader({ eventUuid }: { eventUuid: string }) {
  const t = useTranslations("Table");

  const { data: attributes, isError: isAttributesError } = useQuery({
    queryKey: ["attributes", eventUuid],
    queryFn: async () => getAttributes(eventUuid),
  });

  const { data: participants, isError: isParticipantsError } = useQuery({
    queryKey: ["participants", eventUuid],
    queryFn: async () => getParticipants(eventUuid),
    select: (data) =>
      data?.toSorted(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
  });

  const { data: emails } = useQuery({
    queryKey: ["emails", eventUuid],
    queryFn: async () => getEmails(eventUuid),
  });

  const { data: blocks } = useQuery({
    queryKey: ["blocks", eventUuid, attributes],
    queryFn: async () => getBlocks(eventUuid, attributes ?? []),
    enabled: Boolean(attributes),
  });

  if (
    isAttributesError ||
    isParticipantsError ||
    participants == null ||
    attributes == null
  ) {
    return <div className="text-center">{t("participantsError")}</div>;
  }

  return (
    <ParticipantTable
      participants={participants}
      attributes={attributes}
      emails={emails ?? []}
      blocks={blocks ?? []}
      eventUuid={eventUuid}
    />
  );
}
