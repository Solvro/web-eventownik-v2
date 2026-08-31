import type { EventAttribute } from "./attributes";
import type { EventForm } from "./forms";
import type { EventLink } from "./link";

export interface Event {
  uuid: string;
  organizerUuid: string;
  name: string;
  description: string | null;
  slug: string;
  startDate: string;
  endDate: string;
  firstFormId: string;
  location: string | null;
  primaryColor: string | null;
  organizer: string | null;
  participantsCount: number | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  photoUrl: string | null;
  registerForm: EventForm | null;
  links: EventLink[];
  isActive: boolean;
  attributes: EventAttribute[];
}
