export type PermissionType =
  | 6 // "email"
  | 5 // "participant"
  | 4 // "form"
  | 3 // "setting"
  | 1; // "all"

export interface Permission {
  id: PermissionType;
  action: string;
  subject: string;
}

export interface CoOrganizer {
  id: string | null;
  email: string;
  permissions: Permission[];
}
