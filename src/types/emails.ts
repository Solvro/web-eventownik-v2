import type { EMAIL_TRIGGERS } from "@/lib/emails";

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
