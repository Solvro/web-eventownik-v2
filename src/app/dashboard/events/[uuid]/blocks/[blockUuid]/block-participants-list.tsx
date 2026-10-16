"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ClientPageNavigation } from "@/components/client-page-navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

import { getBlockParticipantsPage } from "../actions";

export function BlockParticipantsList({
  eventUuid,
  attributeUuid,
  blockUuid,
}: {
  eventUuid: string;
  attributeUuid: string;
  blockUuid: string;
}) {
  const t = useTranslations("Form");
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: [
      "private-block-occupants",
      eventUuid,
      attributeUuid,
      blockUuid,
      page,
    ],
    queryFn: async () =>
      getBlockParticipantsPage(eventUuid, attributeUuid, blockUuid, page),
    placeholderData: keepPreviousData,
  });
  if (isError) {
    return <p role="alert">{t("blockDataFetchFailed")}</p>;
  }
  if (isPending) {
    return <p>{t("loadingBlocks")}</p>;
  }
  return (
    <div className="w-full">
      <ScrollArea className="h-50 w-full rounded-md border p-4">
        {data.data.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("noParticipants")}</p>
        ) : (
          <ul>
            {data.data.map((participant) => (
              <li key={participant.uuid} className="py-1 text-sm">
                {participant.email}
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      <ClientPageNavigation
        meta={data.meta}
        busy={isFetching}
        onPageChange={setPage}
      />
    </div>
  );
}
