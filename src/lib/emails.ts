import type { useTranslations } from "next-intl";

type EmailTriggersKey = Parameters<
  ReturnType<typeof useTranslations<"EmailTriggers">>
>[0];

export interface EmailTrigger {
  name: EmailTriggersKey;
  description: EmailTriggersKey;
  value: string;
}

export const EMAIL_TRIGGERS: readonly EmailTrigger[] = [
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
  {
    name: "attributeChange",
    description: "attributeChangeDesc",
    value: "attribute_changed",
  },
  {
    name: "manual",
    description: "manualDesc",
    value: "manual",
  },
];

/** Native delivery statuses used in email history filters. */
export const EMAIL_HISTORY_STATUS_FILTER_VALUES = [
  "sent",
  "pending",
  "failed",
] as const;
