import type { AttributeType } from "./attributes";
import type { PaginationMeta } from "./common";

/** EVENT: one check-in point for the whole event. BLOCK: one per block attribute */
export type TicketMode = "EVENT" | "BLOCK";

export interface Ticket {
  uuid: string;
  eventUuid: string;
  mode: TicketMode;
  /** Block attribute guarded by a BLOCK ticket. Null for EVENT tickets */
  attributeUuid: string | null;
  /** Attributes shown to staff when scanning */
  shownAttributeUuids: string[];
  createdAt: string;
  updatedAt: string;
}

export type TicketScanStatus =
  | "VALID"
  | "ALREADY_CONFIRMED"
  | "INVALID_TICKET"
  | "WRONG_EVENT"
  | "WRONG_BLOCK";

export interface TicketScanAttribute {
  attributeUuid: string;
  name: string;
  type: AttributeType;
  value: unknown;
  /** Names of the chosen blocks. Only set for block attributes */
  blockNames?: string[];
}

export interface TicketScanResult {
  status: TicketScanStatus;
  /** Set for VALID and ALREADY_CONFIRMED */
  participant?: { uuid: string; email: string };
  /** Set for VALID and ALREADY_CONFIRMED */
  attributes?: TicketScanAttribute[];
  /** Set for ALREADY_CONFIRMED */
  confirmedAt?: string;
  /** Set for WRONG_BLOCK: the blocks the participant is registered for */
  blockNames?: string[];
}

export interface TicketCheckIn {
  uuid: string;
  ticketUuid: string;
  participantUuid: string;
  blockUuid: string | null;
  confirmedAt: string;
}

/** Error body of a rejected check-in: 409 for ALREADY_CONFIRMED, 422 otherwise */
export interface TicketCheckInError {
  status: Exclude<TicketScanStatus, "VALID">;
  message: string;
}

export interface TicketParticipant {
  uuid: string;
  email: string;
  attributes: TicketScanAttribute[];
  attendance: { confirmed: boolean; confirmedAt: string | null };
}

export interface GetTicketParticipantsResponse {
  data: TicketParticipant[];
  meta: PaginationMeta;
}

export interface TicketPublic {
  token: string;
  event: {
    name: string;
    startDate: string;
    endDate: string;
    location: string | null;
    primaryColor: string | null;
    photoUrl: string | null;
  };
}
