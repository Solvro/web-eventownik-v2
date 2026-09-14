"use client";

import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import type { AnswerBucket } from "@/app/dashboard/events/[uuid]/statistics/aggregate";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Empty, EmptyDescription } from "@/components/ui/empty";

const BAR_ROW_HEIGHT = 36;
const CHART_PADDING = 24;
const MAX_LABEL_CHARS = 24;
const COUNT_OFFSET = 8;
const COUNT_DIGIT_WIDTH = 7;
const MIN_COUNT_GUTTER_WIDTH = 32;
const DEFAULT_BAR_FILL = "var(--event-primary-color)";
const NO_ANSWER_FILL = "#9ca3af";

interface BarRow {
  key: string;
  label: string;
  count: number;
  fill: string;
}

function ellipsise(label: string): string {
  return label.length > MAX_LABEL_CHARS
    ? `${label.slice(0, MAX_LABEL_CHARS - 1).trimEnd()}…`
    : label;
}

export function StatisticsBarChart({ data }: { data: AnswerBucket[] }) {
  const t = useTranslations("Statistics");

  if (data.length === 0) {
    return (
      <Empty className="border">
        <EmptyDescription>{t("noData")}</EmptyDescription>
      </Empty>
    );
  }

  const drawsOwnColors = data.some((entry) => entry.color != null);

  const rows: BarRow[] = data.map((entry, index) => ({
    key: `b${index.toString()}`,
    label: entry.answer,
    count: entry.count,
    fill: drawsOwnColors ? (entry.color ?? NO_ANSWER_FILL) : DEFAULT_BAR_FILL,
  }));

  const labelByKey = new Map(rows.map((row) => [row.key, row.label]));

  const widestCount = Math.max(...rows.map((row) => row.count));
  const countGutterWidth = Math.max(
    MIN_COUNT_GUTTER_WIDTH,
    COUNT_OFFSET + widestCount.toString().length * COUNT_DIGIT_WIDTH,
  );

  const chartConfig: ChartConfig = Object.fromEntries(
    rows.map((row) => [row.key, { label: row.label }]),
  );

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto w-full"
      style={{ height: rows.length * BAR_ROW_HEIGHT + CHART_PADDING }}
    >
      <BarChart
        accessibilityLayer
        data={rows}
        layout="vertical"
        margin={{ top: 4, right: countGutterWidth, bottom: 4, left: 0 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="key"
          type="category"
          width="auto"
          tickLine={false}
          axisLine={false}
          tickFormatter={(key: string) => ellipsise(labelByKey.get(key) ?? key)}
        />
        <XAxis dataKey="count" type="number" hide />
        <ChartTooltip
          content={<ChartTooltipContent nameKey="key" hideLabel />}
        />
        <Bar dataKey="count" radius={4}>
          <LabelList
            dataKey="count"
            position="right"
            offset={COUNT_OFFSET}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
