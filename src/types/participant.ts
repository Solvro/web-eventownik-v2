import type { JsonValue } from "./v3";

export interface ParticipantIdentity {
  uuid: string;
  email: string;
}

export interface ParticipantSelection {
  participants: ParticipantIdentity[] | null;
  busy: boolean;
  onSelectAll: () => void;
  onClear: () => void;
}

export interface Participant {
  uuid: string;
  email: string;
  createdAt: string;
  attributes: {
    uuid: string;
    name: string;
    value: JsonValue;
    createdAt: string;
    updatedAt: string;
  }[];
}

export interface FlattenedParticipant {
  uuid: string;
  email: string;
  createdAt: string;
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
