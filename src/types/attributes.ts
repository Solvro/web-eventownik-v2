import type { AttributeTypes } from "@/app/dashboard/(create-event)/state";

import type { PaginationMeta } from "./common";

export interface AttributeConfig {
  options?: string[];
  isSensitiveData?: boolean;
  reason?: string;
  allowOther?: boolean;
  isMultiple?: boolean;
  isRequired?: boolean;
  maxSelections?: number;
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

export type AttributeType = (typeof AttributeTypes)[number];
