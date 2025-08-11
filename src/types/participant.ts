import type { AttributeBase, PublicParticipantAttribute } from "./attributes";

export interface Participant {
  id: number;
  email: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  attributes: AttributeBase[];
}

export interface PublicParticipant extends Omit<Participant, "attributes"> {
  eventId: number;
  attributes: PublicParticipantAttribute[];
}

export interface FlattenedParticipant {
  id: number;
  email: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  mode: "edit" | "view";
  wasExpanded: boolean;
  //key is attribute id
  [key: string]: ParticipantAttributeValueType;
}

export type ParticipantAttributeValueType =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;
