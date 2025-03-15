import type { AttributeTypes } from "@/app/dashboard/(create-event)/state";

export interface EventAttribute {
  id: number;
  name: string;
  slug: string;
  eventId: number;
  options: Record<string, unknown>;
  type: string;
  rootBlockId: number;
  showInList: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormAttribute {
  id: number;
  isIncluded: boolean;
  isRequired: boolean;
  isEditable: boolean;
}

export interface AttributeBase {
  id: number;
  name: string;
  value: string;
  slug: string;
}

export interface Attribute extends Omit<AttributeBase, "value"> {
  eventId: number;
  showInList: boolean;
  options: string[] | null;
  type: AttributeType;
  createdAt: string;
  updatedAt: string;
}

export type AttributeType = (typeof AttributeTypes)[number];
