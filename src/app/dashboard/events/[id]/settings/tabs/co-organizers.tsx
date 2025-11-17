import { useSetAtom } from "jotai";
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
import type {
  CoOrganizer,
  Permission,
  PermissionType,
} from "@/types/co-organizer";

import { areSettingsDirty } from "../settings-context";
import type { TabProps } from "./tab-props";

const PERMISSIONS_CONFIG: { permission: Permission; label: string }[] = [
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
  onPermissionToggle: (permission: Permission) => void;
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
      <div className="flex w-full items-center gap-2">
        <div className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-12 grow items-center rounded-xl border bg-transparent py-3 ps-1 pe-4 text-lg shadow-xs transition-colors file:border-0 file:bg-transparent focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 sm:w-full sm:min-w-80 md:text-sm [&::-webkit-inner-spin-button]:appearance-none">
          <Image
            src={avatarUrl}
            alt={`${email}'s avatar`}
            width={32}
            height={32}
            className="mr-2 h-10 w-10 rounded-lg"
            aria-hidden="true"
          />
          <span className="px-2 py-2 text-sm leading-none font-medium">
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
            className="bg-accent w-min"
          >
            <div className="flex flex-col gap-2">
              <span className="text-sm leading-none font-medium">
                Tymczasowo nie można rozdzielać uprawnień
              </span>
              {PERMISSIONS_CONFIG.map(({ permission, label }) => (
                <div
                  key={permission.id}
                  className="mb-2 flex items-center space-x-2"
                >
                  <Checkbox
                    id={`permission-${permission.id.toString()}`}
                    checked={
                      permissions.map((p) => p.id).includes(permission.id) ||
                      permissions.map((p) => p.id).includes(1)
                    }
                    onCheckedChange={() => {
                      onPermissionToggle(permission);
                    }}
                    disabled={true} // temporary disabled
                  />
                  <Label
                    htmlFor={`permission-${permission.id.toString()}`}
                    className="cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
              <Button
                variant="link"
                className="text-destructive m-0 h-6 justify-start p-0"
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

export function CoOrganizers({
  coOrganizers,
  setCoOrganizers,
  setCoOrganizersChanges,
}: TabProps) {
  const [newEmail, setNewEmail] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<
    PermissionType[]
  >([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isEmailValid = isValidEmail(newEmail);

  const setIsDirty = useSetAtom(areSettingsDirty);

  const handleAddOrganizer = (
    email: string,
    permissionsIds: PermissionType[],
  ) => {
    const permissions = permissionsIds
      .map(
        (id) =>
          PERMISSIONS_CONFIG.find((config) => config.permission.id === id)
            ?.permission,
      )
      .filter(
        (permission): permission is Permission => permission !== undefined,
      );
    setCoOrganizers((previous) => [
      ...previous,
      {
        id: null,
        email,
        permissions,
      },
    ]);
    setCoOrganizersChanges((previous) => ({
      ...previous,
      added: [
        ...previous.added,
        {
          id: null,
          email,
          permissions,
        },
      ],
    }));
    setIsDirty(true);
  };

  const handleRemoveOrganizer = (email: string) => {
    setCoOrganizers((previous) =>
      previous.filter((org) => org.email !== email),
    );
    setCoOrganizersChanges((previous) => ({
      ...previous,
      deleted: [
        ...previous.deleted,
        coOrganizers.find((org) => org.email === email),
      ].filter((org): org is CoOrganizer => org !== undefined),
    }));
    setIsDirty(true);
  };

  const handlePermissionToggle = useCallback(
    (email: string, permission: Permission) => {
      setCoOrganizers((previous) => {
        const newCoOrganizers = previous.map((org) =>
          org.email === email
            ? {
                ...org,
                permissions: org.permissions.some((p) => p.id === permission.id)
                  ? org.permissions.filter((p) => p.id !== permission.id)
                  : [...org.permissions, permission],
              }
            : org,
        );

        const updatedCoOrganizer = newCoOrganizers.find(
          (org) => org.email === email,
        );
        if (updatedCoOrganizer != null) {
          setCoOrganizersChanges((previousChanges) => ({
            ...previousChanges,
            updated: [
              ...previousChanges.updated.filter((org) => org.email !== email),
              updatedCoOrganizer,
            ],
          }));
        }
        return newCoOrganizers;
      });
      setIsDirty(true);
    },
    [setCoOrganizers, setCoOrganizersChanges],
  );

  return (
    <div className="flex w-full flex-row flex-wrap gap-4">
      <div className="flex flex-col">
        <p className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Współorganizatorzy
        </p>
        <div className="max-w-full space-y-2 pt-2">
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
              className="h-12 rounded-xl text-lg sm:w-full sm:min-w-80 md:text-sm"
            />
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 w-12 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    !isEmailValid ||
                    coOrganizers.some((co) => co.email === newEmail)
                  }
                  onClick={() => {
                    setSelectedPermissions([6, 5, 4, 3]);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-accent w-min">
                <div className="flex flex-col gap-2">
                  <span className="text-sm leading-none font-medium">
                    Tymczasowo nie można rozdzielać uprawnień
                  </span>
                  {PERMISSIONS_CONFIG.map(({ permission, label }) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`permission-${permission.id.toString()}-new`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            setSelectedPermissions((previous) => [
                              ...previous,
                              permission.id,
                            ]);
                          } else {
                            setSelectedPermissions((previous) =>
                              previous.filter((p) => p !== permission.id),
                            );
                          }
                        }}
                        disabled={true} // temporary disabled
                      />
                      <Label
                        htmlFor={`permission-${permission.id.toString()}-new`}
                        className="cursor-pointer"
                      >
                        {label}
                      </Label>
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
                      variant="eventDefault"
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
          <span className="text-muted-foreground text-sm leading-none font-medium">
            Możesz dodać tylko osoby, które mają konto w Eventowniku
          </span>
        </div>
      </div>
    </div>
  );
}
