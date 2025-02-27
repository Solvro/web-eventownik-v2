import type { AttributeBase } from "./attributes";

export interface Participant {
  id: number;
  email: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  attributes: AttributeBase[];
}

export interface FlattenedParticipant {
  id: number;
  email: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: string | number | boolean | Date | null;
}
