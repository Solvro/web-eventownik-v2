import type { FormAttribute } from "./attributes";

export interface EventForm {
  id: number;
  eventId: string;
  isOpen: boolean;
  isFirstForm: boolean;
  description: string;
  name: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  attributes: FormAttribute[];
}
