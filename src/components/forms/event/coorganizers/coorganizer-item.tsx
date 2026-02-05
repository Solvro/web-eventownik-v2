import { EllipsisVertical, UserRoundMinus } from "lucide-react";
import Image from "next/image";
import { memo, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Permission } from "@/types/co-organizer";

import { PERMISSIONS_CONFIG } from "./types";
import type { CoOrganizerItemProps } from "./types";
import { generateAvatarUrl } from "./utils";

export const CoOrganizerItem = memo(
  ({
    id: _id,
    email,
    permissions,
    onPermissionToggle,
    onRemove,
  }: CoOrganizerItemProps) => {
    const avatarUrl = useMemo(() => generateAvatarUrl(email), [email]);
    const permissionIdsSet = new Set<number>(
      permissions.map((p: Permission) => p.id),
    );
    return (
      <div className="flex w-full items-center gap-2">
        <div className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-12 grow items-center rounded-xl border bg-transparent py-3 ps-1 pe-4 text-lg shadow-xs transition-colors file:border-0 file:bg-transparent focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 sm:w-full md:text-sm [&::-webkit-inner-spin-button]:appearance-none">
          <Image
            src={avatarUrl}
            alt={`${email}'s avatar`}
            width={32}
            height={32}
            className="mr-2 h-10 w-10 rounded-lg"
            aria-hidden="true"
          />
          <span className="truncate px-2 py-2 text-sm leading-none font-medium">
            {email}
          </span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              aria-label="Open permissions menu"
              className="size-12"
            >
              <EllipsisVertical />
            </Button>
          </PopoverTrigger>

          <PopoverContent side="right" align="start" className="w-min">
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
                      permissionIdsSet.has(permission.id) ||
                      permissionIdsSet.has(1)
                    }
                    onCheckedChange={() => {
                      onPermissionToggle(permission);
                    }}
                    disabled={true} // temporary disabled
                    aria-label={label}
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
