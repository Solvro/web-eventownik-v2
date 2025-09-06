"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lightbulb, Loader, Save, Text, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { WysiwygEditor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedForm } from "@/hooks/use-unsaved";
import { EMAIL_TRIGGERS } from "@/lib/emails";
import type { EventAttribute } from "@/types/attributes";
import type { SingleEventEmail } from "@/types/emails";
import type { EventForm } from "@/types/forms";

import { updateEventEmail } from "../actions";

const EventEmailEditFormSchema = z
  .object({
    trigger: z.enum(
      EMAIL_TRIGGERS.map((t) => t.value) as [string, ...string[]],
    ),
    triggerValue: z.string().optional(),
    triggerValue2: z.string().optional(),
    name: z.string().nonempty({ message: "Tytuł nie może być pusty." }),
    content: z.string().nonempty({ message: "Treść nie może być pusta." }),
  })
  .refine(
    (data) => {
      if (data.trigger === "form_filled") {
        return data.triggerValue !== undefined && data.triggerValue !== "";
      }
      if (data.trigger === "attribute_changed") {
        return (
          (data.triggerValue !== undefined && data.triggerValue !== "") ||
          (data.triggerValue2 !== undefined && data.triggerValue2 !== "")
        );
      }
      return true;
    },
    {
      message: "Wybrany wyzwalacz potrzebuje dodatkowej konfiguracji",
    },
  );

function TriggerTypeExplanation({ trigger }: { trigger: string }) {
  const target = EMAIL_TRIGGERS.find((t) => t.value === trigger);

  if (target === undefined) {
    return null;
  }

  return (
    <div className="flex max-w-lg grow flex-col gap-2 rounded-md border border-[var(--event-primary-color)]/25 p-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4" /> Wyjaśnienie
      </div>
      <p className="text-sm">{target.description}</p>
    </div>
  );
}

function TriggerConfigurationInputs({
  eventAttributes,
  eventForms,
  trigger,
  form,
}: {
  eventAttributes: EventAttribute[];
  eventForms: EventForm[];
  trigger: string;
  form: ReturnType<typeof useForm<z.infer<typeof EventEmailEditFormSchema>>>;
}) {
  const target = EMAIL_TRIGGERS.find((t) => t.value === trigger);

  if (target === undefined) {
    return null;
  }

  switch (target.value) {
    case "participant_registered":
    case "participant_deleted":
    case "manual": {
      return (
        <p className="text-muted-foreground my-2 text-sm">
          Ten wyzwalacz nie wymaga dodatkowej konfiguracji
        </p>
      );
    }
    case "form_filled": {
      return (
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="triggerValue"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Formularz</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz formularz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {eventForms.map((eventForm) => (
                      <SelectItem
                        key={eventForm.id}
                        value={eventForm.id.toString()}
                      >
                        {eventForm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }
    case "attribute_changed": {
      return (
        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="triggerValue"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Atrybut</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz atrybut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {eventAttributes.map((attribute) => (
                      <SelectItem
                        key={attribute.id}
                        value={String(attribute.id)}
                      >
                        {attribute.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="triggerValue2"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Wyzwalająca wartość atrybutu</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="tak" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }
  }
}

function EventEmailEditForm({
  eventId,
  eventAttributes,
  eventForms,
  emailToEdit,
}: {
  eventId: string;
  eventAttributes: EventAttribute[];
  eventForms: EventForm[];
  emailToEdit: SingleEventEmail;
}) {
  const form = useForm<z.infer<typeof EventEmailEditFormSchema>>({
    resolver: zodResolver(EventEmailEditFormSchema),
    defaultValues: {
      trigger: emailToEdit.trigger,
      triggerValue: emailToEdit.triggerValue ?? "",
      triggerValue2: emailToEdit.triggerValue2 ?? "",
      name: emailToEdit.name,
      content: emailToEdit.content,
    },
  });
  const { toast } = useToast();

  const { isGuardActive, onCancel, onConfirm } = useUnsavedForm(
    form.formState.isDirty,
  );

  async function onSubmit(values: z.infer<typeof EventEmailEditFormSchema>) {
    const updatedMail = {
      ...values,
      triggerValue:
        values.triggerValue === "" || values.triggerValue === undefined
          ? null
          : values.triggerValue,
    };
    const result = await updateEventEmail(
      eventId,
      emailToEdit.id.toString(),
      updatedMail,
    );

    if (result.success) {
      toast({
        title: "Zapisano zmiany w szablonie",
      });
      form.reset(values);
    } else {
      toast({
        title: "Nie udało się zapisać zmian w szablonie!",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <UnsavedChangesAlert
        active={isGuardActive}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4 rounded-md bg-[var(--event-primary-color)]/10 p-4 text-2xl font-semibold">
          <div className="border-foreground rounded-full border p-2">
            <Zap />
          </div>
          <h2>Wyzwalacz</h2>
        </div>
        <h3 className="font-semibold">Wybierz rodzaj wyzwalacza</h3>
        <div className="flex justify-between">
          <FormField
            control={form.control}
            name="trigger"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {EMAIL_TRIGGERS.map((trigger) => (
                      <FormItem
                        className="flex items-center space-y-0 space-x-3"
                        key={trigger.value}
                      >
                        <FormControl>
                          <RadioGroupItem
                            value={trigger.value}
                            onClick={() => {
                              form.clearErrors();
                            }}
                          />
                        </FormControl>
                        <FormLabel>{trigger.name}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          {form.watch("trigger") && (
            <TriggerTypeExplanation trigger={form.getValues("trigger")} />
          )}
        </div>
        <div className="bg-muted-foreground/25 h-[1px] w-full" />
        <div className="flex min-h-[216px] flex-col gap-4">
          <h2 className="font-semibold">Skonfiguruj wyzwalacz</h2>
          <FormMessage>
            {Object.keys(form.formState.errors).length > 0
              ? "Wybrany wyzwalacz wymaga dodatkowej konfiguracji. Wypełnij wszystkie poniższe pola"
              : ""}
          </FormMessage>
          <div className="flex flex-col gap-8">
            <TriggerConfigurationInputs
              trigger={form.getValues("trigger")}
              eventAttributes={eventAttributes}
              eventForms={eventForms}
              form={form}
            />
          </div>
          <div className="flex items-center gap-4 rounded-md bg-[var(--event-primary-color)]/10 p-4 text-2xl font-semibold">
            <div className="border-foreground rounded-full border p-2">
              <Text />
            </div>
            <h2>Zawartość wiadomości</h2>
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tytuł wiadomości</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Dziękujemy za rejestrację!"
                    {...field}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.name?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treść wiadomości</FormLabel>
                <WysiwygEditor
                  content={form.getValues("content")}
                  onChange={field.onChange}
                />
                <FormMessage>
                  {form.formState.errors.content?.message}
                </FormMessage>
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          variant="eventDefault"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader className="animate-spin" />
          ) : (
            <Save />
          )}{" "}
          Zapisz
        </Button>
      </form>
    </Form>
  );
}

export { EventEmailEditForm };
