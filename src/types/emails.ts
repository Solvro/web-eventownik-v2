import type { EMAIL_TRIGGERS } from "@/lib/emails";

import type { PuckData } from "./editor";

/** Target of a trigger: the form for `FORM_FILLED`, empty for triggers without a target */
export interface EmailTriggerConfig {
  formUuid?: string;
  attributeUuid?: string;
  expectedValue?: unknown;
}

/**
 * Data about a single email when fetching the entire list. Does not have `content`.
 */
export interface EventEmail {
  id: string;
  eventId: string;
  name: string;
  trigger: (typeof EMAIL_TRIGGERS)[number]["value"];
  triggerConfig: EmailTriggerConfig | null;
  createdAt: string;
  updatedAt: string;
  meta: {
    failedCount: number;
    pendingCount: number;
    sentCount: number;
  };
}

/** One delivery of an email to a participant */
export interface EventEmailParticipantData {
  /** UUID of the participant, missing if the participant was deleted */
  id?: string;
  email?: string;
  status: "pending" | "sent" | "failed";
  sendAt: string;
  sendBy: string | null;
}

/**
 * Data about a single email when fetching a single email. Does not have the `meta` field but has `content` and `schema`
 */
export interface SingleEventEmail extends Omit<EventEmail, "meta"> {
  content: string;
  /** Puck editor data, `null` for emails created with the simple form */
  schema: PuckData | null;
}

export interface UpdateEventEmailPayload {
  name: string;
  content: string;
  /** Puck editor data serialized to JSON, `null` for emails created with the simple form */
  schema: string | null;
  trigger: string;
  /** UUID of the form for the `FORM_FILLED` trigger, sent as `triggerConfig.formUuid` */
  triggerValue: string | null;
  triggerValue2?: string | null;
}
