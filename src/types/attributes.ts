import type { AttributeTypes } from "@/app/dashboard/(create-event)/state";

export interface EventAttribute {
  id: number;
  name: string;
  slug: string | null;
  eventId: number;
  options: string[] | null;
  type: string;
  rootBlockId: number | undefined;
  showInList: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeBase {
  id: number;
  name: string;
  value: string;
  slug: string | null;
}

export interface Attribute extends Omit<AttributeBase, "value"> {
  eventId: number;
  showInList: boolean;
  options: string[] | null;
  type: AttributeType;
  createdAt: string;
  updatedAt: string;
}

export interface FormAttribute extends Attribute {
  id: number;
  order: number | null;
  isRequired: boolean;
  isEditable: boolean;
}

export interface FormAttributeBase {
  id: number;
  order?: number | null;
  isRequired: boolean;
  isEditable: boolean;
}

export type AttributeType = (typeof AttributeTypes)[number];
