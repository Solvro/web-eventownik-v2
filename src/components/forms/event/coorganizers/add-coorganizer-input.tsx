import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PermissionType } from "@/types/co-organizer";

import { PERMISSIONS_CONFIG } from "./types";
import { isValidEmail } from "./utils";

interface AddCoOrganizerInputProps {
  existingEmails: string[];
  onAdd: (email: string, permissionIds: PermissionType[]) => void;
}

export function AddCoOrganizerInput({
  existingEmails,
  onAdd,
}: AddCoOrganizerInputProps) {
  const [newEmail, setNewEmail] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<
    PermissionType[]
  >([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const isEmailValid = isValidEmail(newEmail);
  const emailAlreadyExists = existingEmails.includes(newEmail);

  const handleAdd = () => {
    onAdd(newEmail, selectedPermissions);
    setNewEmail("");
    setIsPopoverOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={newEmail}
        onChange={(event_) => {
          setNewEmail(event_.target.value);
        }}
        placeholder="Wprowadź email współorganizatora"
        className="h-12 rounded-xl text-lg sm:w-full md:text-sm"
      />
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-12 w-12 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isEmailValid || emailAlreadyExists}
            onClick={() => {
              setSelectedPermissions([6, 5, 4, 3]);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-min">
          <div className="flex flex-col gap-2">
            <span className="text-sm leading-none font-medium">
              Tymczasowo nie można rozdzielać uprawnień
            </span>
            {PERMISSIONS_CONFIG.map(({ permission, label }) => (
              <div key={permission.id} className="flex items-center space-x-2">
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
              <Button variant="eventDefault" onClick={handleAdd}>
                Dodaj
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
