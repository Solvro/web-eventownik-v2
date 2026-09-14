// TODO(refactor): Refactor types across this entire file.

/**
 * The attribute types the app knows, spelled the way this codebase spells them
 * everywhere. A backend that spells one of them differently is translated where
 * its response is parsed, so nothing downstream has to know which backend the
 * answer came from.
 */
export type AttributeType =
  | "text"
  | "textarea"
  | "number"
  | "file"
  | "drawing"
  | "select"
  | "block"
  | "date"
  | "time"
  | "datetime"
  | "multiselect"
  | "email"
  | "tel"
  | "color"
  | "checkbox";

/**
 * Per-type settings the backend stores alongside an attribute.
 *
 * `select`, `multiselect` and `block` attributes declare their full option set
 * in `options`; `allowOther` permits answers outside that set.
 */
export interface AttributeConfig {
  options?: string[];
  allowOther?: boolean;
}

export interface EventAttribute {
  uuid: string;
  name: string;
  slug: string | null;
  eventUuid: number;
  options: string[] | null;
  config: AttributeConfig | null;
  type: AttributeType;
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

/**
 * @param value - Data returned from API is always a string (even numbers, booleans are in string format - "true", "123")
 */
export interface AttributeBase {
  uuid: string;
  name: string;
  value: string | string[];
  slug: string | null;
}

export interface Attribute extends Omit<AttributeBase, "value"> {
  eventUuid: string;
  showInList: boolean;
  options: string[] | null;
  type: AttributeType;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  // TODO(refactor): Cleanup type definitions. Added here for now to implement multiselect blocks.
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

export interface FormAttributeBase {
  uuid: string;
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
