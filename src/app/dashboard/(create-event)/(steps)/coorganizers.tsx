"use client";

import { EllipsisVertical, Plus, UserRoundMinus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
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

export const EventCoorganizersFormSchema = z.object({
  coorganizers: z
    .array(
      z.object({
        id: z.string(),
        email: z.string(),
        permissions: z.array(z.custom<Permission>()),
      }),
    )
    .superRefine((coorganizers, context) => {
      // make changes to the validation based on the length of the array
      if (coorganizers.length === 1) {
        // if there's only one item, allow it to be an empty string, we will filter it out later
        const result = z
          .string()
          .email()
          .or(z.literal(""))
          .safeParse(coorganizers[0].email);
        if (!result.success) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [0, "email"],
            message: "Podaj poprawny adres email",
          });
        }
      } else {
        // if there are more than one, all emails must be valid
        for (const [index, coorganizer] of coorganizers.entries()) {
          const result = z
            .string()
            .email({
              message: "Podaj poprawny adres email",
            })
            .safeParse(coorganizer.email);
          if (!result.success) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: [index, "email"],
              message: result.error.issues[0].message,
            });
          }
        }
      }
    })
    .transform((coorganizers) =>
      // this filter will remove the item if it was the only one and it was empty
      coorganizers.filter((coorganizer) => coorganizer.email.trim() !== ""),
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
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <p>Współorganizatorzy</p>
          <p className="text-muted-foreground text-sm leading-none font-medium">
            Możesz dodać tylko osoby, które mają konto w Eventowniku
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            append({
              id: "",
              email: "",
              permissions: PERMISSIONS_CONFIG.map((p) => p.permission),
            });
          }}
          className="h-12 w-12 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {fields.map((coorganizer, index) => (
        <div
          key={coorganizer.email}
          className="flex w-full flex-row items-start justify-between gap-2"
        >
          <FormItem className="w-full">
            <Input
              disabled={formState.isSubmitting}
              type="text"
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
        <Button
          variant="outline"
          className="h-12 w-12"
          aria-label="Open permissions menu"
        >
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
