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
  openCondition: OpenCondition;
  order: number;
  attributes: FormAttribute[];
}

export type CompleteEventForm = Omit<EventForm, "openDate" | "closeDate"> & {
  openDate: Date;
  closeDate: Date;
  openTime: string;
  closeTime: string;
};

export enum OpenCondition {
  ON_DATE = "ON_DATE",
  MANUAL = "MANUAL",
}
