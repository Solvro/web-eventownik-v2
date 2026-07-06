import type { useTranslations } from "next-intl";

import type { LooseAutocomplete } from "@/types/utils";

import { MessageTagCategory, getCategories } from "./categories";

export type MessageTagColor = LooseAutocomplete<
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "brown"
>;

export interface MessageTag {
  title: string;
  description: string;
  value: string;
  color: MessageTagColor;
  category?: MessageTagCategory;
}

export function getMessageTags(
  t: ReturnType<typeof useTranslations<"MessageTags">>,
): MessageTag[] {
  return [
    {
      title: t("eventName"),
      description: t("eventNameDesc"),
      value: "/event_name",
      color: "red",
      category: getCategories(t).event,
    },
    {
      title: t("eventStartDate"),
      description: t("eventStartDateDesc"),
      value: "/event_start_date",
      color: "orange",
      category: getCategories(t).event,
    },
    {
      title: t("eventEndDate"),
      description: t("eventEndDateDesc"),
      value: "/event_end_date",
      color: "yellow",
      category: getCategories(t).event,
    },
    {
      title: t("participantEmail"),
      description: t("participantEmailDesc"),
      value: "/participant_email",
      color: "blue",
      category: getCategories(t).participant,
    },
    {
      title: t("registrationDate"),
      description: t("registrationDateDesc"),
      value: "/participant_created_at",
      color: "pink",
      category: getCategories(t).participant,
    },
  ];
}

export const getTagStyle = (allTags: MessageTag[], tagValue: string) => {
  const color = allTags.find((tag) => tag.value === tagValue)?.color;
  return color === undefined
    ? "color: var(--accent-foreground); background-color: var(--accent)"
    : `color: var(--tag-${color}-text); background-color: var(--tag-${color}-bg)`;
};
