export type PermissionType =
  | "MANAGE_ALL"
  | "MANAGE_EVENT"
  | "MANAGE_FORM"
  | "MANAGE_PARTICIPANT"
  | "MANAGE_EMAIL"
  | "MANAGE_SETTINGS"
  | "MANAGE_TICKET"
  | "SCAN_TICKET";

export interface Permission {
  id: PermissionType;
}

export interface CoOrganizer {
  id: string | null;
  email: string;
  permissions: Permission[];
}

/** Organizer as returned by the organizers list endpoint */
export interface EventOrganizer {
  uuid: string;
  email: string;
  permissions: { permission: PermissionType }[];
}
