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
  {
    permission: { id: "MANAGE_SETTINGS" },
    label: "settings",
  },
  {
    permission: { id: "MANAGE_FORM" },
    label: "forms",
  },
  {
    permission: { id: "MANAGE_PARTICIPANT" },
    label: "participants",
  },
  {
    permission: { id: "MANAGE_EMAIL" },
    label: "emails",
  },
  {
    permission: { id: "MANAGE_TICKET" },
    label: "tickets",
  },
  {
    permission: { id: "SCAN_TICKET" },
    label: "scanTickets",
  },
];
