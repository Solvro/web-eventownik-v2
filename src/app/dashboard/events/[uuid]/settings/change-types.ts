import type { NewEventAttribute } from "@/components/forms/event/attributes/types";
import type { CoOrganizer } from "@/types/co-organizer";

export type AttributeChangeData = NewEventAttribute & {
  config?: Record<string, unknown> | null;
};

export interface AttributeChange {
  type: "add" | "update" | "delete";
  data: AttributeChangeData;
  timestamp: number;
}

export interface CoOrganizerChange {
  type: "add" | "update" | "delete";
  data: CoOrganizer;
  timestamp: number;
}
