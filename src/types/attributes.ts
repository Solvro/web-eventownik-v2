import type { PaginationMeta } from "./common";

export interface AttributeConfig {
  options?: string[];
  participantFields?: string[];
  allowOther?: boolean;
  isRequired?: boolean;
  maxSelections?: number | null;
}
export type AttributeOption = string | { label: string; value: string };

export interface Attribute {
  uuid: string;
  type: AttributeType;
  name: string;
  order: number;
  showInList: boolean;
  config: AttributeConfig;
}

export interface GetAttributesResponse {
  data: Attribute[];
  meta: PaginationMeta;
}

export interface PublicFormAttribute {
  uuid: string;
  name: string;
  type: AttributeType;
  order: number;
  showInList: boolean;
  config: AttributeConfig;
  createdAt?: string;
  updatedAt?: string;
}

export type AttributeType =
  | "text"
  | "number"
  | "textArea"
  | "file"
  | "drawing"
  | "select"
  | "multiSelect"
  | "block"
  | "date"
  | "time"
  | "datetime"
  | "email"
  | "tel"
  | "color"
  | "checkbox";
