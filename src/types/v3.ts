import type { EventLink } from "./link";

/** Fields returned by v3 event list/detail endpoints. */
export interface V3Event {
  uuid: string;
  organizerUuid: string | null;
  name: string;
  description: string | null;
  slug: string;
  startDate: string;
  endDate: string;
  registerFormUuid: string | null;
  location: string | null;
  primaryColor: string | null;
  organizerName: string | null;
  participantsLimit: number | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  photoUrl: string | null;
  links: EventLink[];
  isPublic: boolean;
  isVerified: boolean;
  isFeatured: boolean;
}

export interface V3Attribute {
  uuid: string;
  eventUuid: string;
  name: string;
  type:
    | "text"
    | "textArea"
    | "number"
    | "select"
    | "multiSelect"
    | "date"
    | "time"
    | "datetime"
    | "email"
    | "tel"
    | "color"
    | "checkbox"
    | "file"
    | "drawing"
    | "block";
  order: number;
  showInList: boolean;
  config: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
export interface V3FormSummary {
  uuid: string;
  eventUuid: string | null;
  name: string;
  description: string | null;
  isOpen: boolean;
  isEditable: boolean;
  openCondition: "MANUAL" | "ON_DATE";
  openDate: string | null;
  closeDate: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface V3Form extends V3FormSummary {
  formDefinitions: {
    uuid: string;
    attributeUuid: string | null;
    formUuid: string | null;
    isRequired: boolean;
    order: number | null;
    attribute: V3Attribute | null;
  }[];
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
export interface V3EmailSummary {
  id: string;
  eventId: string;
  name: string;
  trigger:
    | "PARTICIPANT_REGISTERED"
    | "PARTICIPANT_DELETED"
    | "FORM_FILLED"
    | "ATTRIBUTE_CHANGED"
    | "MANUAL";
  triggerConfig: {
    formUuid?: string;
    attributeUuid?: string;
    expectedValue?: JsonValue;
  } | null;
  schema: JsonValue | null;
  createdAt: string;
  updatedAt: string;
  meta: { sentCount: number; pendingCount: number; failedCount: number };
}
export interface V3Email extends Omit<V3EmailSummary, "meta"> {
  content: string;
  order: number | null;
}
export interface V3EmailDelivery {
  id?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  status: "pending" | "sent" | "failed";
  sendAt: string;
  sendBy: string | null;
}

export interface V3PublicEvent extends V3Event {
  registerForm: V3FormSummary | null;
}

export interface V3PrivacyAttribute {
  uuid: string;
  name: string;
  isSensitiveData: boolean;
  reason: string | null;
}

export type V3Permission =
  | "MANAGE_ALL"
  | "MANAGE_EVENT"
  | "MANAGE_SETTINGS"
  | "MANAGE_FORM"
  | "MANAGE_PARTICIPANT"
  | "MANAGE_EMAIL";
export interface V3Organizer {
  uuid: string;
  email: string;
  permissions: {
    uuid: string;
    permission: V3Permission;
    eventUuid: string;
    adminUuid: string;
  }[];
}

export interface V3PublicParticipant {
  uuid: string;
  email: string;
  eventUuid: string;
  createdAt: string;
  updatedAt: string;
  attributes: {
    attributeUuid: string;
    value: JsonValue;
    updatedAt: string;
    attribute: V3Attribute;
  }[];
}

export interface V3Block {
  uuid: string;
  name: string;
  description: string | null;
  capacity: number | null;
  parentUuid: string | null;
  attributeUuid: string | null;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  isRootBlock: boolean;
  children: V3Block[];
  blockParticipantCount: number;
}
