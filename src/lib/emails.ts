import type { useTranslations } from "next-intl";

import type { LooseAutocomplete } from "@/types/utils";

type EmailTriggersKey = Parameters<
  ReturnType<typeof useTranslations<"EmailTriggers">>
>[0];

export const EMAIL_TRIGGERS: {
  name: EmailTriggersKey;
  description: EmailTriggersKey;
  value: string;
}[] = [
  {
    name: "participantRegistration",
    description: "participantRegistrationDesc",
    value: "participant_registered",
  },
  {
    name: "participantRemoval",
    description: "participantRemovalDesc",
    value: "participant_deleted",
  },
  {
    name: "formSubmission",
    description: "formSubmissionDesc",
    value: "form_filled",
  },
  // NOTE: Commented out because this trigger is not yet implemented on the backend.
  // {
  //   name: "attributeChange",
  //   description: "attributeChangeDesc",
  //   value: "attribute_changed",
  // },
  {
    name: "manual",
    description: "manualDesc",
    value: "manual",
  },
] as const;

type EmailTagColor = LooseAutocomplete<
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

export interface EmailTag {
  title: string;
  description: string;
  value: string;
  color: EmailTagColor;
}

/** Values used for pivot_status in email send history filters (API + UI). */
export const EMAIL_HISTORY_STATUS_FILTER_VALUES = [
  "sent",
  "pending",
  "failed",
] as const;

export const EMAIL_TAGS = [
  {
    title: "Nazwa wydarzenia",
    description: "Zamienia się w prawdziwą nazwę wydarzenia",
    value: "event_name",
    color: "red",
  },
  {
    title: "Data rozpoczęcia",
    description: "Zamienia się w datę rozpoczęcia wydarzenia",
    value: "event_start_date",
    color: "orange",
  },
  {
    title: "Data zakończenia",
    description: "Zamienia się w datę zakończenia wydarzenia",
    value: "event_end_date",
    color: "yellow",
  },
  {
    title: "Slug wydarzenia",
    description: "Zamienia się w slug wydarzenia",
    value: "event_slug",
    color: "green",
  },
  {
    title: "Kolor wydarzenia",
    description: "Zamienia się w wybrany kolor wydarzenia",
    value: "event_primary_color",
    color: "teal",
  },
  {
    title: "Email uczestnika",
    description: "Zamienia się w email uczestnika",
    value: "participant_email",
    color: "blue",
  },
  {
    title: "ID uczestnika",
    description: "Zamienia się w ID uczestnika",
    value: "participant_id",
    color: "indigo",
  },
  {
    title: "Slug uczestnika",
    description: "Zamienia się w slug uczestnika",
    value: "participant_slug",
    color: "purple",
  },
  {
    title: "Data rejestracji",
    description:
      "Zamienia się w datę zarejestrowania się uczestnika na wydarzenie",
    value: "participant_created_at",
    color: "pink",
  },
] as const satisfies EmailTag[];
