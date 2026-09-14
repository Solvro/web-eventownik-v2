"use client";

import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { LabelList, Pie, PieChart } from "recharts";

import type { AnswerBucket } from "@/app/dashboard/events/[uuid]/statistics/aggregate";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";

// Slices lighten from the base event colour (largest slice) toward this floor,
// so even the lightest labelled slice keeps enough saturation for readable text.
const RAMP_FLOOR = 55;

// Slices thinner than this share of the pie skip their on-slice label and rely
// on the legend, matching the mockup and avoiding overlapping text.
const LABEL_MIN_PERCENT = 0.05;

const RADIAN = Math.PI / 180;

// The no-answer bucket of a colour attribute has no hex of its own, so it takes
// a neutral grey that reads as "no colour picked" rather than as a choice.
const NO_ANSWER_FILL = "#9ca3af";

// Labels on a ramp slice keep the event's own foreground colour, which is
// already chosen for contrast against the event's palette.
const RAMP_LABEL_FILL = "var(--event-primary-foreground-color)";

const DARK_LABEL_FILL = "#000000";
const LIGHT_LABEL_FILL = "#ffffff";

// Where black and white contrast equally against a fill, by WCAG relative
// luminance.
const LUMINANCE_MIDPOINT = 0.179;

function sliceColor(index: number, total: number): string {
  const pct =
    total <= 1 ? 100 : 100 - ((100 - RAMP_FLOOR) * index) / (total - 1);
  return `color-mix(in oklch, var(--event-primary-color) ${pct.toString()}%, white)`;
}

/** One sRGB channel, gamma-expanded to its linear contribution. */
function linearChannel(byte: number): number {
  const channel = byte / 255;
  return channel <= 0.040_45
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

/**
 * Black or white, whichever stays legible on `hex`.
 *
 * Participants pick arbitrary colours, so a label sitting on a slice cannot
 * assume the fill is dark: a pale answer would otherwise be white on white.
 */
function labelFillOn(hex: string): string {
  const digits = hex.replace("#", "");
  // A shorthand `#abc` stands for the `#aabbcc` each digit doubles into.
  const expanded =
    digits.length < 6 ? digits.replaceAll(/([\da-f])/gi, "$1$1") : digits;
  const channel = (index: number) =>
    linearChannel(
      Number.parseInt(expanded.slice(index * 2, index * 2 + 2), 16),
    );
  const luminance =
    0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);

  return luminance > LUMINANCE_MIDPOINT ? DARK_LABEL_FILL : LIGHT_LABEL_FILL;
}

interface Slice {
  key: string;
  label: string;
  count: number;
  fill: string;
  /** Label colour that stays readable on `fill`. */
  labelFill: string;
}

// LabelList calls its `content` fn once per slice with a polar viewBox rather
// than the flat props the old `label` render prop received, so we derive the
// mid-angle ourselves. Only the fields we read are typed.
interface SliceLabelProps {
  viewBox?: {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    endAngle?: number;
  };
  index?: number;
  value?: number;
}

export function StatisticsPieChart({ data }: { data: AnswerBucket[] }) {
  const t = useTranslations("Statistics");

  if (data.length === 0) {
    return (
      <Empty className="border">
        <EmptyDescription>{t("noData")}</EmptyDescription>
      </Empty>
    );
  }

  const drawsOwnColors = data.some((entry) => entry.color != null);

  const slices: Slice[] = data.map((entry, index) => {
    const ownFill = drawsOwnColors ? (entry.color ?? NO_ANSWER_FILL) : null;

    return {
      key: `s${index.toString()}`,
      label: entry.answer,
      count: entry.count,
      fill: ownFill ?? sliceColor(index, data.length),
      labelFill: ownFill == null ? RAMP_LABEL_FILL : labelFillOn(ownFill),
    };
  });

  const chartConfig: ChartConfig = Object.fromEntries(
    slices.map((slice) => [slice.key, { label: slice.label }]),
  );

  // The polar viewBox carries no percentage, so reconstruct each slice's share
  // from the counts to apply the same LABEL_MIN_PERCENT cutoff.
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  const renderSliceLabel = ({
    viewBox: { cx, cy, innerRadius, outerRadius, startAngle, endAngle } = {},
    index,
    value,
  }: SliceLabelProps) => {
    const slice = index == null ? undefined : slices[index];

    if (
      slice == null ||
      (value != null && slice.count !== value) ||
      cx == null ||
      cy == null ||
      innerRadius == null ||
      outerRadius == null ||
      startAngle == null ||
      endAngle == null ||
      total === 0 ||
      slice.count / total < LABEL_MIN_PERCENT
    ) {
      return null;
    }

    const midAngle = (startAngle + endAngle) / 2;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <g fill={slice.labelFill}>
        <text
          x={x}
          y={y - 8}
          textAnchor="middle"
          fontWeight={600}
          fontSize={13}
        >
          {slice.label}
        </text>
        <text x={x} y={y + 9} textAnchor="end" fontSize={12}>
          {slice.count}
        </text>
        <User
          x={x + 2}
          y={y - 1}
          width={13}
          height={13}
          color={slice.labelFill}
        />
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
      <ChartContainer
        config={chartConfig}
        className="aspect-square w-full max-w-xl"
      >
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent nameKey="key" hideLabel />}
          />
          <Pie data={slices} dataKey="count" nameKey="key">
            <LabelList
              content={
                renderSliceLabel as ComponentProps<typeof LabelList>["content"]
              }
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <ScrollArea className="h-96 w-full max-w-xs lg:w-auto">
        <div className="space-y-4 pr-6">
          {slices.map((slice) => (
            <div key={slice.key} className="flex items-center gap-3">
              <span
                className="size-8 shrink-0 rounded-full"
                style={{ backgroundColor: slice.fill }}
                aria-hidden
              />
              <div className="flex flex-col">
                <span className="font-semibold">{slice.label}</span>
                <span className="text-muted-foreground flex items-center gap-1 text-sm">
                  {slice.count}
                  <User className="size-3.5" aria-hidden />
                  <span className="sr-only">{t("participantsCount")}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
