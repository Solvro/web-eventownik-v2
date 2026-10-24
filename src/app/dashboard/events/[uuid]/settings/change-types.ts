import type { Attribute } from "@/types/attributes";
import type { CoOrganizer } from "@/types/co-organizer";

export interface AttributeChange {
  type: "add" | "update" | "delete";
  data: Omit<Attribute, "createdAt" | "updatedAt">;
  timestamp: number;
}

export interface CoOrganizerChange {
  type: "add" | "update" | "delete";
  data: CoOrganizer;
  timestamp: number;
}
