"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getAttributes,
  getBlocks,
  getEmails,
  getParticipants,
} from "./actions";
import { ParticipantTable } from "./table/participants-table";

export function ParticipantsLoader({ eventId }: { eventId: string }) {
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

  const { data: emails } = useQuery({
    queryKey: ["emails", eventId],
    queryFn: async () => getEmails(eventId),
  });

  const { data: blocks } = useQuery({
    queryKey: ["blocks", eventId, attributes],
    queryFn: async () => getBlocks(eventId, attributes ?? []),
    enabled: Boolean(attributes),
  });

  if (
    isAttributesError ||
    isParticipantsError ||
    participants == null ||
    attributes == null
  ) {
    // TODO move error message to localization / improve visuals
    return <div>Nie udało się załadować danych o uczestnikach</div>;
  }

  return (
    <ParticipantTable
      participants={participants}
      attributes={attributes}
      emails={emails ?? []}
      blocks={blocks ?? []}
      eventId={eventId}
    />
  );
}
