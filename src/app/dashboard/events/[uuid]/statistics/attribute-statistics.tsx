"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import {
  buildAttributeStatistic,
  flattenBlockNames,
} from "@/app/dashboard/events/[uuid]/statistics/aggregate";
import {
  getAttributeBlockTree,
  getParticipantsForStats,
} from "@/app/dashboard/events/[uuid]/statistics/data-access";
import { eventAttributesQueryOptions } from "@/app/dashboard/events/[uuid]/statistics/queries";
import { StatisticsAnswerList } from "@/app/dashboard/events/[uuid]/statistics/statistics-answer-list";
import { StatisticsBarChart } from "@/app/dashboard/events/[uuid]/statistics/statistics-bar-chart";
import { StatisticsPieChart } from "@/app/dashboard/events/[uuid]/statistics/statistics-pie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import { getAttributeLabel } from "@/lib/utils";
import type { AttributeType } from "@/types/attributes";

export function AttributeStatistics({
  eventUuid,
  selectedId,
}: {
  eventUuid: string;
  selectedId: string | undefined;
}) {
  const t = useTranslations("Statistics");
  const locale = useLocale();

  const {
    data: attributes,
    isPending,
    isError,
  } = useQuery(eventAttributesQueryOptions(eventUuid));

  const selectedAttribute = attributes?.find(
    (attribute) => attribute.uuid === selectedId,
  );

  // Participants are fetched once for the whole page, with every attribute
  // included, so switching the selected attribute never refetches.
  const statisticsAttributes = attributes ?? [];
  const participantsQuery = useQuery({
    queryKey: ["attribute-stats-participants", eventUuid, statisticsAttributes],
    queryFn: async () =>
      getParticipantsForStats(eventUuid, statisticsAttributes),
    enabled: statisticsAttributes.length > 0,
  });

  // A block answer stores block uuids, so a block attribute needs its tree
  // before its chart can be labelled. Every other type resolves nothing, and
  // this query stays disabled.
  const isBlockAttribute = selectedAttribute?.type === "block";
  const blockTreeQuery = useQuery({
    queryKey: ["attribute-block-tree", eventUuid, selectedAttribute?.uuid],
    queryFn: async () =>
      getAttributeBlockTree(eventUuid, selectedAttribute?.uuid ?? ""),
    enabled: isBlockAttribute,
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
            href={`/dashboard/events/${eventUuid}/settings`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("manageAttributes")}
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  if (participantsQuery.isPending || blockTreeQuery.isLoading) {
    return (
      <Empty className="border">
        <EmptyDescription>{t("loading")}</EmptyDescription>
      </Empty>
    );
  }

  if (
    participantsQuery.isError ||
    blockTreeQuery.isError ||
    selectedAttribute == null
  ) {
    return (
      <Empty className="border">
        <EmptyDescription>{t("loadError")}</EmptyDescription>
      </Empty>
    );
  }

  const statistic = buildAttributeStatistic({
    attribute: selectedAttribute,
    participants: participantsQuery.data,
    blockNames: flattenBlockNames(blockTreeQuery.data),
    labels: {
      noAnswer: t("noAnswer"),
      yes: t("yes"),
      no: t("no"),
      unknownBlock: t("unknownBlock"),
    },
  });

  return (
    <AttributeStatisticView
      statistic={statistic}
      type={selectedAttribute.type}
    />
  );
}

function AttributeStatisticView({
  statistic,
  type,
}: {
  statistic: ReturnType<typeof buildAttributeStatistic>;
  type: AttributeType;
}) {
  const t = useTranslations("Statistics");

  switch (statistic.kind) {
    case "none": {
      return (
        <Empty className="border">
          <EmptyDescription>{t("noStatisticForType")}</EmptyDescription>
        </Empty>
      );
    }
    case "pie": {
      return <StatisticsPieChart data={statistic.buckets} />;
    }
    case "bar": {
      return <StatisticsBarChart data={statistic.buckets} />;
    }
    case "list": {
      return <StatisticsAnswerList answers={statistic.answers} type={type} />;
    }
  }
}
