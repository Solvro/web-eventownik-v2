import type { V3Permission } from "./v3";

export type PermissionType = V3Permission;
export type Permission = V3Permission;

/** Editable organizer form state. */
export interface CoOrganizer {
  id: string | null;
  email: string;
  permissions: V3Permission[];
}
