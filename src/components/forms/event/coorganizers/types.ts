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
    permission: {
      id: 3,
      action: "manage",
      subject: "setting",
    },
    label: "settings",
  },
  {
    permission: {
      id: 4,
      action: "manage",
      subject: "form",
    },
    label: "forms",
  },
  {
    permission: {
      id: 5,
      action: "manage",
      subject: "participant",
    },
    label: "participants",
  },
  {
    permission: {
      id: 6,
      action: "manage",
      subject: "email",
    },
    label: "emails",
  },
];
