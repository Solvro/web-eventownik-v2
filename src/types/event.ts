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
  organizerUuid: string | null;
  description: string | null;
  registerFormUuid: string | null;
  location: string | null;
  primaryColor: string | null;
  organizerName: string | null;
  participantsLimit: number | null;
  contactEmail: string | null;
  photoUrl: string | null;
  isPublic: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  /** Included only by the public event endpoint, without form definition attributes */
  registerForm?: EventForm | null;
  links: EventLink[];
}
