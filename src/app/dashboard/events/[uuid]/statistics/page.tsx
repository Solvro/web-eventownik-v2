"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Activity, useState } from "react";

import { AttributeStatistics } from "@/app/dashboard/events/[uuid]/statistics/attribute-statistics";
import { AttributeStatisticsPicker } from "@/app/dashboard/events/[uuid]/statistics/attribute-statistics-picker";
import { eventAttributesQueryOptions } from "@/app/dashboard/events/[uuid]/statistics/queries";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatisticView = "attributes" | "visits";

export default function StatisticsPage() {
  const t = useTranslations("Statistics");
  const { uuid } = useParams<{ uuid: string }>();
  const [statistic, setStatistic] = useState<StatisticView>("attributes");

  const { data: attributes } = useQuery(eventAttributesQueryOptions(uuid));

  const [selectedAttributeUuid, setSelectedAttributeUuid] = useState<string>();

  // Derive the effective selection so we don't need an effect to seed a default.
  const selectedId = selectedAttributeUuid ?? attributes?.[0]?.uuid;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={statistic}
          onValueChange={(value: StatisticView) => {
            setStatistic(value);
          }}
        >
          <SelectTrigger className="w-full max-w-64">
            <SelectValue placeholder={t("selectPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"attributes"}>
              {t("attributesOption")}
            </SelectItem>
            <SelectItem value={"visits"}>{t("visitsOption")}</SelectItem>
          </SelectContent>
        </Select>
        {statistic === "attributes" &&
          attributes != null &&
          attributes.length > 0 && (
            <AttributeStatisticsPicker
              attributes={attributes}
              value={selectedId}
              onSelect={setSelectedAttributeUuid}
            />
          )}
      </div>
      <Activity mode={statistic === "attributes" ? "visible" : "hidden"}>
        <AttributeStatistics eventUuid={uuid} selectedId={selectedId} />
      </Activity>
      <Activity mode={statistic === "visits" ? "visible" : "hidden"}>
        <Empty className="border">
          <EmptyDescription>{t("visitsComingSoon")}</EmptyDescription>
        </Empty>
      </Activity>
    </div>
  );
}
