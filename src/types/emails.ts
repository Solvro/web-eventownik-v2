import type { EMAIL_TRIGGERS } from "@/lib/emails";

import type { Participant } from "./participant";

/**
 * Data about a single email when fetching the entire list
 */
export interface EventEmail {
  id: number;
  eventId: number;
  name: string;
  trigger: (typeof EMAIL_TRIGGERS)[number]["value"];
  triggerValue: string | null;
  triggerValue2?: string | null;
  createdAt: string;
  updatedAt: string;
  meta: {
    failedCount: string;
    pendingCount: string;
    sentCount: string;
  };
}

export interface EventEmailParticipantData
  extends Omit<Participant, "attributes"> {
  meta: {
    pivot_status: string;
    pivot_email_id: number;
    pivot_participant_id: number;
    pivot_send_at: Date;
    pivot_send_by: string;
  };
}

/**
 * Data about a single email when fetching a single email
 */
export interface SingleEventEmail extends Omit<EventEmail, "meta"> {
  content: string;
  participants: EventEmailParticipantData[];
}

export interface UpdateEventEmailPayload {
  name: string;
  trigger: string;
  triggerValue: string | null;
  triggerValue2?: string | null;
}
