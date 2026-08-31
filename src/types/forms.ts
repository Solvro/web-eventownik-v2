import type { FormAttribute } from "./attributes";

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
  openCondition: "MANUAL" | "ON_DATE";
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
