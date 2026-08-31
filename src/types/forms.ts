import type { PublicFormAttribute } from "./attributes";

type OpenCondition = "ON_DATE" | "MANUAL";

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
  isEditable?: boolean;
  openDate?: string;
  closeDate?: string;
  description?: string;
  isFirstForm?: boolean;
  attributes: FormAttribute[];
  openCondition?: OpenCondition;
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
}
