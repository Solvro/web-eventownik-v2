import type { FormAttribute } from "./attributes";

export interface EventForm {
  uuid: string;
  eventUuid: string;
  isOpen: boolean;
  isFirstForm: boolean;
  description: string;
  name: string;
  slug: string;
  openTime: string;
  closeTime: string;
  openDate: Date | null;
  closeDate: Date | null;
  openCondition: OpenCondition;
  order: number;
  attributes: FormAttribute[];
}

export type NonNullableEventForm = Omit<EventForm, "openDate" | "closeDate"> & {
  openDate: Date;
  closeDate: Date;
};

export enum OpenCondition {
  ON_DATE = "ON_DATE",
  MANUAL = "MANUAL",
}
