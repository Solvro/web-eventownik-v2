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
  slug: string;
  openDate: Date | null;
  closeDate: Date | null;
  openCondition: OpenCondition;
  order: number;
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
  createdAt: string;
  updatedAt: string;
}

export type CompleteEventForm = Omit<EventForm, "openDate" | "closeDate"> & {
  openDate: Date;
  closeDate: Date;
  openTime: string;
  closeTime: string;
};
