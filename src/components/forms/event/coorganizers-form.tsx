"use client";

import { useCallback } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { z } from "zod";

import { cn } from "@/lib/utils";
import type { Permission, PermissionType } from "@/types/co-organizer";

import { AddCoOrganizerInput } from "./coorganizers/add-coorganizer-input";
import { CoOrganizerItem } from "./coorganizers/coorganizer-item";
import type { EventCoorganizersFormSchema } from "./coorganizers/schema";
import { PERMISSIONS_CONFIG } from "./coorganizers/types";

export { EventCoorganizersFormSchema } from "./coorganizers/schema";
export { PERMISSIONS_CONFIG } from "./coorganizers/types";

interface CoorganizersFormProps {
  onAdd?: (coorganizer: {
    id: string;
    email: string;
    permissions: Permission[];
  }) => void;
  onRemove?: (
    index: number,
    coorganizer: { id: string; email: string; permissions: Permission[] },
  ) => void;
  onChange?: (
    coorganizers: { id?: string; email?: string; permissions?: Permission[] }[],
  ) => void;
  className?: string;
}

export function CoorganizersForm({
  onAdd,
  onRemove,
  onChange,
  className,
}: CoorganizersFormProps = {}) {
  const { control, getValues } =
    useFormContext<z.infer<typeof EventCoorganizersFormSchema>>();

  const { append, remove, fields } = useFieldArray({
    name: "coorganizers",
    control,
  });

  interface CoOrganizerFormItem {
    id: string;
    email: string;
    permissions: Permission[];
  }

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

    append({ id: "", email, permissions });
    onAdd?.({ id: "", email, permissions });
  };

  const handleRemoveOrganizer = (email: string) => {
    const current = getValues("coorganizers") as CoOrganizerFormItem[];
    const index = current.findIndex((org) => org.email === email);
    if (index === -1) {
      return;
    }
    const removed = current[index];
    remove(index);
    onRemove?.(index, removed);
    onChange?.(current.filter((_, index_) => index_ !== index));
  };

  const handlePermissionToggle = useCallback(
    (email: string, permission: Permission) => {
      const current = getValues("coorganizers") as CoOrganizerFormItem[];
      const index = current.findIndex((org) => org.email === email);
      if (index === -1) {
        return;
      }
      const currentPermissions = current[index].permissions;
      const exists = currentPermissions.some(
        (p: Permission) => p.id === permission.id,
      );
      const updated = exists
        ? currentPermissions.filter((p: Permission) => p.id !== permission.id)
        : [...currentPermissions, permission];
      const updatedCoorganizers = current.map((org, index_) =>
        index_ === index ? { ...org, permissions: updated } : org,
      );
      onChange?.(updatedCoorganizers);
    },
    [getValues, onChange],
  );

  return (
    <div className={cn("flex w-full flex-col flex-wrap gap-2", className)}>
      <p className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Współorganizatorzy
      </p>
      <div className="max-w-full space-y-2 pt-2">
        {fields.map((coOrganizer) => (
          <CoOrganizerItem
            key={coOrganizer.id}
            id={coOrganizer.id}
            email={coOrganizer.email}
            permissions={coOrganizer.permissions}
            onPermissionToggle={(permission) => {
              handlePermissionToggle(coOrganizer.email, permission);
            }}
            onRemove={() => {
              handleRemoveOrganizer(coOrganizer.email);
            }}
          />
        ))}
        <AddCoOrganizerInput
          existingEmails={fields.map((co) => co.email)}
          onAdd={handleAddOrganizer}
        />
        <span className="text-muted-foreground text-sm leading-none font-medium text-wrap">
          Możesz dodać tylko osoby, które mają konto w Eventowniku
        </span>
      </div>
    </div>
  );
}
