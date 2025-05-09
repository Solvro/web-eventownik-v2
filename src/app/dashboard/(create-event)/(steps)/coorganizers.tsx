"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import {
  ArrowLeft,
  ArrowRight,
  EllipsisVertical,
  Loader2,
  Plus,
  UserRoundMinus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Permission } from "@/types/co-organizer";

import { FormContainer } from "../form-container";
import { eventAtom } from "../state";

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

const EventCoorganizersFormSchema = z.object({
  email: z.string().email("Podaj poprawny adres email"),
  permissions: z.number().array(),
});

export function CoorganizersForm({
  goToPreviousStep,
  goToNextStep,
}: {
  goToPreviousStep: () => void;
  goToNextStep: () => void;
}) {
  const [event, setEvent] = useAtom(eventAtom);
  const form = useForm<z.infer<typeof EventCoorganizersFormSchema>>({
    resolver: zodResolver(EventCoorganizersFormSchema),
    defaultValues: {
      email: "",
      permissions: [6, 5, 4, 3],
    },
  });

  function onSubmit(data: z.infer<typeof EventCoorganizersFormSchema>) {
    // TODO: verify if coorganizer exists in the database
    setEvent((_event) => ({
      ..._event,
      coorganizers: [
        ..._event.coorganizers,
        {
          // ID has to be empty for now because it will be generated by the backend
          id: "",
          email: data.email,
          permissions: PERMISSIONS_CONFIG.filter((p) =>
            data.permissions.includes(p.permission.id),
          ).map((p) => p.permission),
        },
      ],
    }));
    form.reset();
  }

  return (
    <FormContainer
      step="3/4"
      title="Krok 3"
      description="Dodaj współorganizatorów"
      icon={<Users />}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <p>Współorganizatorzy</p>
          {event.coorganizers.map((coorganizer) => (
            <div
              key={coorganizer.id}
              className="flex w-full flex-row items-center justify-between gap-2"
            >
              <p className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-12 w-full rounded-xl border bg-transparent px-4 py-3 text-lg shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden md:text-sm">
                {coorganizer.email}
              </p>
              <EditCoOrganizer
                permissions={coorganizer.permissions}
                onRemove={() => {
                  setEvent((_event) => ({
                    ..._event,
                    coorganizers: _event.coorganizers.filter(
                      (co) => co.id !== coorganizer.id,
                    ),
                  }));
                }}
              />
            </div>
          ))}
          <Form {...form}>
            <form className="flex flex-row gap-2">
              <NewCoOrganizer
                form={form}
                onSubmit={form.handleSubmit(onSubmit)}
              />
            </form>
          </Form>
          <span className="text-muted-foreground text-sm leading-none font-medium">
            Możesz dodać tylko osoby, które mają konto w Eventowniku
          </span>
        </div>
        <div className="flex flex-row items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={goToPreviousStep}
            disabled={form.formState.isSubmitting}
          >
            <ArrowLeft /> Wróć
          </Button>
          <Button
            className="w-min"
            variant="ghost"
            disabled={form.formState.isSubmitting}
            onClick={goToNextStep}
          >
            {form.formState.isSubmitting ? (
              <>
                Zapisywanie danych... <Loader2 className="animate-spin" />
              </>
            ) : (
              <>
                Dalej <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </div>
    </FormContainer>
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
  form,
  onSubmit,
}: {
  form: UseFormReturn<{
    email: string;
    permissions: number[];
  }>;
  onSubmit: () => void;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <>
      <FormField
        name="email"
        control={form.control}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormControl>
              <Input
                disabled={form.formState.isSubmitting}
                type="email"
                className="h-12 rounded-xl text-lg sm:w-full sm:min-w-80 md:text-sm"
                placeholder="Wprowadź email współorganizatora"
                {...field}
              />
            </FormControl>
            <FormMessage>{form.formState.errors.email?.message}</FormMessage>
          </FormItem>
        )}
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
                  checked={form
                    .getValues("permissions")
                    .includes(permission.id)}
                  onCheckedChange={(checked) => {
                    if (checked === true) {
                      form.setValue("permissions", [
                        ...form.getValues("permissions"),
                        permission.id,
                      ]);
                    } else {
                      form.setValue(
                        "permissions",
                        form
                          .getValues("permissions")
                          .filter((p) => p !== permission.id),
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
                type="button"
                onClick={() => {
                  setIsPopoverOpen(false);
                }}
              >
                Anuluj
              </Button>
              <Button
                onClick={() => {
                  onSubmit();
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
