import type { EventAttribute } from "./attributes";
import type { EventCategory } from "./categories";
import type { EventForm } from "./forms";

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
  primaryColor: string | null;
  organizer: string | null;
  participantsCount: number | null;
  contactEmail: string | null;
  socialMediaLinks: string[] | null;
  createdAt: string;
  updatedAt: string;
  photoUrl: string | null;
  firstForm: EventForm | null;
  termsLink: string | null;
  isActive: boolean;
  attributes: EventAttribute[];
  categories: EventCategory[];
}
