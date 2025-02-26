export interface EventForm {
  id: number;
  eventId: number;
  isOpen: boolean;
  description: string;
  name: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  attributeIds: number[];
}
