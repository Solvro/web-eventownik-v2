import type { FormAttribute } from "./attributes";

export interface EventForm {
  id: string;
  eventId: string;
  isOpen: boolean;
  isFirstForm: boolean;
  description: string;
  name: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  attributes: FormAttribute[];
}
