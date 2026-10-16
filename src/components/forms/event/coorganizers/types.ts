import type { useTranslations } from "next-intl";

import type { Permission } from "@/types/co-organizer";

export interface CoOrganizerItemProps {
  id?: string | null;
  email: string;
  permissions: Permission[];
  onPermissionToggle: (permission: Permission) => void;
  onRemove: () => void;
}

type EventPermissionsKey = Parameters<
  ReturnType<typeof useTranslations<"EventPermissions">>
>[0];

export const PERMISSIONS_CONFIG: {
  permission: Permission;
  label: EventPermissionsKey;
}[] = [
  { permission: "MANAGE_SETTINGS", label: "settings" },
  { permission: "MANAGE_FORM", label: "forms" },
  { permission: "MANAGE_PARTICIPANT", label: "participants" },
  { permission: "MANAGE_EMAIL", label: "emails" },
];
