import type { Attribute } from "./attributes";
import type { EventForm } from "./forms";
import type { EventLink } from "./link";

export interface Event {
  name: string;
  uuid: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  organizerUuid: string;
  description: string | null;
  registerFormUuid: string;
  registerForm?: EventForm;
  location: string | null;
  primaryColor: string | null;
  organizer: string | null;
  participantsCount: number | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  photoUrl: string | null;
  firstForm: EventForm | null;
  links: EventLink[];
  isActive: boolean;
  attributes: Attribute[];
}
