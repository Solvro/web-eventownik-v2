import { sha256 } from "js-sha256";
import { EllipsisVertical, Plus, UserRoundMinus } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { TabProps } from "./tab-props";

type PermissionType = "settings" | "forms" | "participants" | "mails";

interface CoOrganizer {
  email: string;
  permissions: PermissionType[];
}

const PERMISSIONS_CONFIG: { id: PermissionType; label: string }[] = [
  { id: "settings", label: "Ustawienia" },
  { id: "forms", label: "Formularze" },
  { id: "participants", label: "Uczestnicy" },
  { id: "mails", label: "Maile" },
];

const DEFAULT_AVATAR_PARAMS = {
  baseUrl: "https://api.dicebear.com/9.x/avataaars/png",
  options:
    "backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9,9ce2f9",
};

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateAvatarUrl = (email: string) => {
  const hash = sha256(email.trim().toLowerCase());
  const defaultAvatar = `${DEFAULT_AVATAR_PARAMS.baseUrl}/${encodeURIComponent(
    `seed=${email}&${DEFAULT_AVATAR_PARAMS.options}`,
  )}`;
  return `https://www.gravatar.com/avatar/${hash}?d=${encodeURIComponent(defaultAvatar)}`;
};

interface CoOrganizerItemProps extends CoOrganizer {
  onPermissionToggle: (permission: PermissionType) => void;
  onRemove: () => void;
}

const CoOrganizerItem = memo(
  ({
    email,
    permissions,
    onPermissionToggle,
    onRemove,
  }: CoOrganizerItemProps) => {
    const avatarUrl = useMemo(() => generateAvatarUrl(email), [email]);

    return (
      <div className="flex items-center gap-2">
        <div className="flex h-12 w-full min-w-80 items-center rounded-xl border border-input bg-transparent py-3 pe-4 ps-1 text-lg shadow-sm transition-colors file:border-0 file:bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-inner-spin-button]:appearance-none">
          <Image
            src={avatarUrl}
            alt={`${email}'s avatar`}
            width={32}
            height={32}
            className="mr-2 h-10 w-10 rounded-lg"
            aria-hidden="true"
          />
          <span className="px-2 py-2 text-sm font-medium leading-none">
            {email}
          </span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" aria-label="Open permissions menu">
              <EllipsisVertical />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side="right"
            align="start"
            className="w-min bg-accent"
          >
            <div className="flex flex-col gap-2">
              {PERMISSIONS_CONFIG.map(({ id, label }) => (
                <div key={id} className="mb-2 flex items-center space-x-2">
                  <Checkbox
                    id={id}
                    checked={permissions.includes(id)}
                    onCheckedChange={() => {
                      onPermissionToggle(id);
                    }}
                  />
                  <Label htmlFor={id} className="cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
              <Button
                variant="link"
                className="m-0 h-6 justify-start p-0 text-destructive"
                onClick={onRemove}
              >
                <UserRoundMinus />
                Usuń
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

CoOrganizerItem.displayName = "CoOrganizerItem";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CoOrganizers({ event, saveFormRef }: TabProps) {
  // Dummy data
  const [coOrganizers, setCoOrganizers] = useState<CoOrganizer[]>([
    {
      email: "john.smith@example.com",
      permissions: ["settings", "forms", "mails"],
    },
    {
      email: "joe.biden@gov.us",
      permissions: ["forms", "participants", "mails"],
    },
    {
      email: "antekczaplicki@gmail.com",
      permissions: ["settings", "forms", "participants"],
    },
  ]);

  const [newEmail, setNewEmail] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<
    PermissionType[]
  >([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isEmailValid = isValidEmail(newEmail);

  const handleAddOrganizer = (email: string, permissions: PermissionType[]) => {
    setCoOrganizers((previous) => [
      ...previous,
      {
        email,
        permissions,
      },
    ]);
  };

  const handleRemoveOrganizer = (email: string) => {
    setCoOrganizers((previous) =>
      previous.filter((org) => org.email !== email),
    );
  };

  const handlePermissionToggle = useCallback(
    (email: string, permission: PermissionType) => {
      setCoOrganizers((previous) =>
        previous.map((org) =>
          org.email === email
            ? {
                ...org,
                permissions: org.permissions.includes(permission)
                  ? org.permissions.filter((p) => p !== permission)
                  : [...org.permissions, permission],
              }
            : org,
        ),
      );
    },
    [],
  );

  return (
    <div className="flex w-full flex-row flex-wrap gap-4">
      <div className="flex flex-col">
        <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Współorganizatorzy
        </p>
        <div className="space-y-2 pt-2">
          {coOrganizers.map((coOrganizer) => (
            <CoOrganizerItem
              key={coOrganizer.email}
              {...coOrganizer}
              onPermissionToggle={(permission) => {
                handlePermissionToggle(coOrganizer.email, permission);
              }}
              onRemove={() => {
                handleRemoveOrganizer(coOrganizer.email);
              }}
            />
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newEmail}
              onChange={(event_) => {
                setNewEmail(event_.target.value);
              }}
              placeholder="Wprowadź email współorganizatora"
              className="h-12 w-full min-w-80 rounded-xl text-lg md:text-sm"
            />
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 w-12 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!isEmailValid}
                  onClick={() => {
                    setSelectedPermissions([
                      "settings",
                      "forms",
                      "participants",
                      "mails",
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-min bg-accent">
                <div className="flex flex-col gap-2">
                  {PERMISSIONS_CONFIG.map(({ id, label }) => (
                    <div key={id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`permission-${id}`}
                        checked={selectedPermissions.includes(id)}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            setSelectedPermissions((previous) => [
                              ...previous,
                              id,
                            ]);
                          } else {
                            setSelectedPermissions((previous) =>
                              previous.filter((p) => p !== id),
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`permission-${id}`}>{label}</Label>
                    </div>
                  ))}
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsPopoverOpen(false);
                      }}
                    >
                      Anuluj
                    </Button>
                    <Button
                      onClick={() => {
                        handleAddOrganizer(newEmail, selectedPermissions);
                        setNewEmail("");
                        setIsPopoverOpen(false);
                      }}
                    >
                      Dodaj
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
