import type { PublicFormAttribute } from "./attributes";

export type OpenCondition = "ON_DATE" | "MANUAL";

export interface EventForm {
  uuid: string;
  name: string;
  isEditable: boolean;
  openDate: string | null;
  closeDate: string | null;
  description: string;
  eventUuid: string;
  isOpen: boolean;
  openCondition: OpenCondition;
  createdAt: string;
  updatedAt: string;
  formDefinitions: FormDefinition[];
}

export interface CreateEventFormDto {
  name: string;
  slug?: string;
  description?: string;
  openDate: Date | null;
  closeDate: Date | null;
  openCondition?: OpenCondition;
  order?: number;
  attributes: FormAttribute[];
  isFirstForm?: boolean;
  isOpen?: boolean;
}

export interface FormAttribute {
  attributeUuid: string;
  isRequired: boolean;
  order: number;
}

export interface FormDefinition {
  formUuid: string;
  isRequired: boolean;
  order: number;
  attribute: PublicFormAttribute;
}

export interface GetPublicFormResponse {
  uuid: string;
  name: string;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
  openDate: string | null;
  closeDate: string | null;
  description: string;
  eventUuid: string;
  isOpen: boolean;
  openCondition: string;
  formDefinitions: FormDefinition[];
}

export interface FormErrorObject {
  rule: string;
  field: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteEventForm {
  name: string;
  description: string;
  isFirstForm: boolean;
  isOpen: boolean;
  slug: string;
  openDate: Date;
  closeDate: Date;
  openTime: string;
  closeTime: string;
  openCondition: OpenCondition;
  attributes: FormAttribute[];
}
