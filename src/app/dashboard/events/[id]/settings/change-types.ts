import type { EventAttribute } from "@/types/attributes";
import type { CoOrganizer } from "@/types/co-organizer";

export type AttributeChangeData = Pick<
  EventAttribute,
  | "name"
  | "slug"
  | "type"
  | "options"
  | "showInList"
  | "order"
  | "isSensitiveData"
  | "reason"
> & { id?: number };

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
