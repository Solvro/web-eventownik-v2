import type { FormAttribute } from "./attributes";

export interface EventForm {
  uuid: string;
  eventUuid: string;
  isOpen: boolean;
  isFirstForm: boolean;
  description: string;
  name: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  order: number;
  attributes: FormAttribute[];
}
