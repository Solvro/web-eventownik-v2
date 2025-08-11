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

/**
 * @param value - Data returned from API is always a string (even numbers, booleans are in string format - "true", "123")
 */
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

/**
 * The attribute type that is returned by the API in the public participant endpoint
 */
export interface PublicParticipantAttribute extends Omit<Attribute, "value"> {
  meta: {
    pivot_value: string;
    pivot_created_at: string;
    pivot_participant_id: number;
    pivot_attribute_id: number;
    pivot_updated_at: string;
  };
}

export type AttributeType = (typeof AttributeTypes)[number];
