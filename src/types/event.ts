import type { Form } from "@/types/form";

export interface Event {
  id: number;
  organizerId: number;
  name: string;
  description: string | null;
  slug: string;
  startDate: string;
  endDate: string;
  firstFormId: number;
  location: string | null;
  primaryColor: string;
  organizer: string | null;
  participantsCount: number | null;
  socialMediaLinks: string[] | null;
  createdAt: string;
  updatedAt: string;
  photoUrl: string | null;
  firstForm: Form | null;
}
