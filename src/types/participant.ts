import type { PaginationMeta } from "./common";

export interface Participant {
  uuid: string;
  email: string;
  createdAt: string;
  attributes: {
    uuid: string;
    name: string;
    value: string | number;
    createdAt: string;
    updatedAt: string;
  }[];
  emails: {
    uuid: string;
    status: string;
    sendAt: string;
    name: string;
    content: string;
    trigger: string;
    triggerValue: string;
  }[];
}

export interface GetParticipantsResponse {
  data: Participant[];
  meta: PaginationMeta;
}

export interface FlattenedParticipant extends Omit<
  Participant,
  "attributes" | "emails"
> {
  mode: "edit" | "view";
  wasExpanded: boolean;
  [attributeUuid: string]: ParticipantAttributeValueType;
}

export type ParticipantAttributeValueType =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;
