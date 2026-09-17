import type { FormAttribute } from "./attributes";

export type OpenCondition = "MANUAL" | "ON_DATE";

export interface EventForm {
  uuid: string;
  eventUuid: string;
  isOpen: boolean;
  isFirstForm: boolean;
  description: string;
  name: string;
  slug: string;
  openDate: Date | null;
  closeDate: Date | null;
  openCondition: OpenCondition;
  order: number;
  attributes: FormAttribute[];
  createdAt: string;
  updatedAt: string;
}

export type CompleteEventForm = Omit<EventForm, "openDate" | "closeDate"> & {
  openDate: Date;
  closeDate: Date;
  openTime: string;
  closeTime: string;
};

export interface FormErrorObject {
  rule: string;
  field: string;
  message: string;
}
