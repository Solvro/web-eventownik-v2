"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { API_URL } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/api";
import { getBackend, paginatedUrl } from "@/lib/backend";
import type { JsonValue, V3Block } from "@/types/v3";

import { ClientPageNavigation } from "./client-page-navigation";
import { ScrollArea } from "./ui/scroll-area";

export function PublicBlockOccupants({
  block,
  eventSlug,
  enabled,
}: {
  block: V3Block;
  eventSlug: string;
  enabled: boolean;
}) {
  const t = useTranslations("Form");
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: [
      "public-block-occupants",
      eventSlug,
      block.attributeUuid,
      block.uuid,
      page,
    ],
    queryFn: async () =>
      getBackend<PaginatedResponse<Record<string, JsonValue>>>(
        paginatedUrl(
          `${API_URL}/public/events/${encodeURIComponent(eventSlug)}/attributes/${String(block.attributeUuid)}/blocks/${block.uuid}/participants`,
          page,
          10,
        ),
      ),
    enabled,
    placeholderData: keepPreviousData,
  });
  if (isError) {
    return <p role="alert">{t("blockDataFetchFailed")}</p>;
  }
  if (isPending) {
    return <p>{t("loadingBlocks")}</p>;
  }
  if (data.data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {t(
          block.blockParticipantCount > 0
            ? "anonymousParticipantsList"
            : "noParticipants",
        )}
      </p>
    );
  }
  return (
    <>
      <ScrollArea className="h-48 pr-3">
        <ul className="space-y-1">
          {data.data.map((row, index) => {
            const name = Object.values(row)
              .filter((value) => value !== null && value !== "")
              .map((value) =>
                typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value),
              )
              .join(" ");
            return (
              <li key={`${String(page)}-${String(index)}`} className="text-sm">
                {name.trim() === "" ? t("anonymousParticipant") : name}
              </li>
            );
          })}
        </ul>
      </ScrollArea>
      <ClientPageNavigation
        meta={data.meta}
        busy={isFetching}
        onPageChange={setPage}
      />
    </>
  );
}
