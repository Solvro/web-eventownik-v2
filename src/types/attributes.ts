import type { AttributeTypes } from "@/app/dashboard/(create-event)/state";

export type AttributeOption = string | { label: string; value: string };
export interface EventAttribute {
  config?: Record<string, unknown> | null;
  uuid: string;
  name: string;
  slug: string | null;
  eventUuid: string;
  options: AttributeOption[] | null;
  type: string;
  rootBlockUuid: string | undefined;
  showInList: boolean;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  isSensitiveData: boolean;
  reason: string | null;
  isMultiple: boolean;
  maxSelections: number | null;
}
export interface AttributeBase {
  uuid: string;
  name: string;
  value: string | string[];
  slug: string | null;
}
export interface Attribute extends Omit<AttributeBase, "value"> {
  eventUuid: string;
  showInList: boolean;
  options: AttributeOption[] | null;
  type: AttributeType;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  isRequired: boolean;
  isEditable: boolean;
  isMultiple: boolean;
  maxSelections: number | null;
}
export interface FormAttribute extends Attribute {
  uuid: string;
  order: number | null;
  isRequired: boolean;
  isEditable: boolean;
  isMultiple: boolean;
  maxSelections: number | null;
}
/** Participant form control state, separate from API responses. */
export interface FormControlAttribute extends Pick<
  FormAttribute,
  | "uuid"
  | "name"
  | "order"
  | "isRequired"
  | "isEditable"
  | "options"
  | "isMultiple"
  | "maxSelections"
> {
  type: AttributeType | "textArea" | "multiSelect";
}
export interface FormAttributeBase {
  uuid: string;
  order?: number | null;
  isRequired: boolean;
  isEditable: boolean;
}
export type AttributeType = (typeof AttributeTypes)[number];
