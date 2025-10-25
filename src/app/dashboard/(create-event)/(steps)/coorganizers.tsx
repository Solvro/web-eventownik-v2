"use client";

import { EllipsisVertical, Plus, UserRoundMinus } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { FormState, UseFieldArrayAppend } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Permission } from "@/types/co-organizer";

// Required for usage of useFieldArray hook
/* eslint-disable @typescript-eslint/restrict-template-expressions */

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

export const EventCoorganizersFormSchema = z.object({
  coorganizers: z.array(
    z.object({
      id: z.string(),
      email: z.string().email("Podaj poprawny adres email"),
      permissions: z.array(z.custom<Permission>()),
    }),
  ),
});

export function CoorganizersForm() {
  const { control, formState, register } =
    useFormContext<z.infer<typeof EventCoorganizersFormSchema>>();

  const { fields, append, remove } = useFieldArray({
    name: "coorganizers",
    control,
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <p>Współorganizatorzy</p>
      {fields.map((coorganizer, index) => (
        <div
          key={coorganizer.email}
          className="flex w-full flex-row items-start justify-between gap-2"
        >
          <FormItem className="w-full">
            <Input
              disabled={formState.isSubmitting}
              type="email"
              className="h-12 rounded-xl text-lg sm:w-full sm:min-w-80 md:text-sm"
              placeholder="Wprowadź email współorganizatora"
              defaultValue={coorganizer.email}
              {...register(`coorganizers.${index}.email` as const)}
            />
            <FormMessage>
              {formState.errors.coorganizers?.[index]?.email?.message}
            </FormMessage>
          </FormItem>
          <EditCoOrganizer
            permissions={coorganizer.permissions}
            onRemove={() => {
              remove(index);
            }}
          />
        </div>
      ))}
      {/**
       * Because of the refactor, we could drop this input -
       * we could just add a new co-organizer button and modify
       * his email and permissions in EditCoOrganizer component.
       */}
      <div className="flex flex-row gap-2">
        <NewCoOrganizer formState={formState} onSubmit={append} />
      </div>
      <span className="text-muted-foreground text-sm leading-none font-medium">
        Możesz dodać tylko osoby, które mają konto w Eventowniku
      </span>
    </div>
  );
}

function EditCoOrganizer({
  permissions,
  onRemove,
}: {
  permissions: Permission[];
  onRemove: () => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-label="Open permissions menu">
          <EllipsisVertical />
        </Button>
      </PopoverTrigger>

      <PopoverContent side="right" align="start" className="bg-accent w-min">
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
                  //onPermissionToggle(permission);
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
  );
}

function NewCoOrganizer({
  formState,
  onSubmit,
}: {
  formState: FormState<z.infer<typeof EventCoorganizersFormSchema>>;
  onSubmit: UseFieldArrayAppend<z.infer<typeof EventCoorganizersFormSchema>>;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [coorganizer, setCoorganizer] = useState<{
    email: string;
    permissions: number[];
  }>({
    email: "",
    permissions: [3, 4, 5, 6],
  });
  return (
    <>
      <Input
        disabled={formState.isSubmitting}
        type="email"
        className="h-12 rounded-xl text-lg sm:w-full sm:min-w-80 md:text-sm"
        placeholder="Wprowadź email współorganizatora"
        value={coorganizer.email}
        onChange={(event) => {
          setCoorganizer({ ...coorganizer, email: event.target.value });
        }}
      />
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-12 w-12 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
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
              <div key={permission.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`permission-${permission.id.toString()}-new`}
                  checked={coorganizer.permissions.includes(permission.id)}
                  onCheckedChange={(checked) => {
                    if (checked === true) {
                      setCoorganizer({
                        ...coorganizer,
                        permissions: [
                          ...coorganizer.permissions,
                          permission.id,
                        ],
                      });
                    } else {
                      setCoorganizer({
                        ...coorganizer,
                        permissions: coorganizer.permissions.filter(
                          (p) => p !== permission.id,
                        ),
                      });
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
                type="button"
                onClick={() => {
                  setIsPopoverOpen(false);
                }}
              >
                Anuluj
              </Button>
              <Button
                onClick={() => {
                  onSubmit({
                    id: "",
                    email: coorganizer.email,
                    permissions: PERMISSIONS_CONFIG.filter((p) =>
                      coorganizer.permissions.includes(p.permission.id),
                    ).map((p) => p.permission),
                  });
                  setCoorganizer({ email: "", permissions: [3, 4, 5, 6] });
                  setIsPopoverOpen(false);
                }}
              >
                Dodaj
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
