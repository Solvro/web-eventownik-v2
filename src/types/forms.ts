export interface EventForm {
  id: string;
  eventId: string;
  isOpen: boolean;
  description: string;
  name: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  attributesIds: number[];
}
