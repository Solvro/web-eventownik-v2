"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { countAttributeValues } from "@/app/dashboard/events/[id]/statistics/aggregate";
import { getParticipantsForStats } from "@/app/dashboard/events/[id]/statistics/data-access";
import { eventAttributesQueryOptions } from "@/app/dashboard/events/[id]/statistics/queries";
import { StatisticsPieChart } from "@/app/dashboard/events/[id]/statistics/statistics-pie-chart";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";

export function AttributeStatistics({
  eventId,
  selectedId,
}: {
  eventId: string;
  selectedId: string | undefined;
}) {
  const t = useTranslations("Statistics");

  const {
    data: attributes,
    isPending,
    isError,
  } = useQuery(eventAttributesQueryOptions(eventId));

  const selectedAttribute = attributes?.find(
    (attribute) => attribute.id.toString() === selectedId,
  );

  const participantsQuery = useQuery({
    queryKey: [
      "attribute-stats-participants",
      eventId,
      selectedId,
      selectedAttribute?.slug,
    ],
    queryFn: async () =>
      getParticipantsForStats(eventId, selectedAttribute?.slug ?? null),
    enabled: selectedAttribute != null,
  });

  if (isPending) {
    return (
      <Empty className="border">
        <EmptyDescription>{t("loading")}</EmptyDescription>
      </Empty>
    );
  }

  if (isError) {
    return (
      <Empty className="border">
        <EmptyDescription>{t("loadError")}</EmptyDescription>
      </Empty>
    );
  }

  if (attributes.length === 0) {
    return (
      <Empty className="border">
        <EmptyDescription>{t("noAttributes")}</EmptyDescription>
        <EmptyContent>
          <Link
            href={`/dashboard/events/${eventId}/settings`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("manageAttributes")}
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  const counts =
    selectedAttribute != null && participantsQuery.data != null
      ? countAttributeValues(
          participantsQuery.data,
          selectedAttribute.id,
          t("noAnswer"),
        )
      : [];

  return (
    <div className="flex flex-col gap-8">
      {participantsQuery.isPending ? (
        <Empty className="border">
          <EmptyDescription>{t("loading")}</EmptyDescription>
        </Empty>
      ) : participantsQuery.isError ? (
        <Empty className="border">
          <EmptyDescription>{t("loadError")}</EmptyDescription>
        </Empty>
      ) : (
        <StatisticsPieChart data={counts} />
      )}
    </div>
  );
}
