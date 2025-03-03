import type { Form } from "@/types/form";

export interface Event {
  id: number;
  organizerId: number;
  name: string;
  description: string;
  slug: string;
  startDate: string;
  endDate: string;
  firstFormId: number;
  lat: number;
  long: number;
  primaryColor: string;
  organizer: string;
  participantsCount: number;
  createdAt: string;
  updatedAt: string;
  photoUrl: string;
  firstForm: Form;
}
