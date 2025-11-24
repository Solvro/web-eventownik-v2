import type { Permission } from "@/types/co-organizer";

export interface CoOrganizerItemProps {
  id?: string | null;
  email: string;
  permissions: Permission[];
  onPermissionToggle: (permission: Permission) => void;
  onRemove: () => void;
}

export const PERMISSIONS_CONFIG: { permission: Permission; label: string }[] = [
  {
    permission: {
      id: 3,
      action: "manage",
      subject: "setting",
    },
    label: "Ustawienia",
  },
  {
    permission: {
      id: 4,
      action: "manage",
      subject: "form",
    },
    label: "Formularze",
  },
  {
    permission: {
      id: 5,
      action: "manage",
      subject: "participant",
    },
    label: "Uczestnicy",
  },
  {
    permission: {
      id: 6,
      action: "manage",
      subject: "email",
    },
    label: "Maile",
  },
];
