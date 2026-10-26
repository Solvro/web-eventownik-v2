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
    value: "PARTICIPANT_REGISTERED",
  },
  {
    name: "participantRemoval",
    description: "participantRemovalDesc",
    value: "PARTICIPANT_DELETED",
  },
  {
    name: "formSubmission",
    description: "formSubmissionDesc",
    value: "FORM_FILLED",
  },
  // NOTE: Commented out because this trigger is not yet implemented on the backend.
  // {
  //   name: "attributeChange",
  //   description: "attributeChangeDesc",
  //   value: "ATTRIBUTE_CHANGED",
  // },
  {
    name: "manual",
    description: "manualDesc",
    value: "MANUAL",
  },
];

/** Delivery statuses used in the email send history filters */
export const EMAIL_HISTORY_STATUS_FILTER_VALUES = [
  "sent",
  "pending",
  "failed",
] as const;
