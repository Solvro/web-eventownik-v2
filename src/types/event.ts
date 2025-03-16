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
  location: string;
  primaryColor: string;
  organizer: string;
  participantsCount: number | null;
  createdAt: string;
  updatedAt: string;
  photoUrl: string | null;
  firstForm: Form | null;
}
