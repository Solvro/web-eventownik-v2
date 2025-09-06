"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowRight, Lightbulb, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormContainer } from "@/app/dashboard/(create-event)/form-container";
import { newEventEmailTemplateAtom } from "@/atoms/new-email-template-atom";
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
import { useAutoSave } from "@/hooks/use-autosave";
import { EMAIL_TRIGGERS } from "@/lib/emails";
import type { EventAttribute } from "@/types/attributes";
import type { EventForm } from "@/types/forms";

const EventEmailTemplateTriggerTypeSchema = z
  .object({
    trigger: z.enum(
      EMAIL_TRIGGERS.map((t) => t.value) as [string, ...string[]],
    ),
    triggerValue: z.string().optional(),
    triggerValue2: z.string().optional(),
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
  form: ReturnType<
    typeof useForm<z.infer<typeof EventEmailTemplateTriggerTypeSchema>>
  >;
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
                <Select onValueChange={field.onChange}>
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
                <Select onValueChange={field.onChange}>
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

function TriggerTypeForm({
  eventAttributes,
  eventForms,
  goToNextStep,
}: {
  eventAttributes: EventAttribute[];
  eventForms: EventForm[];
  goToNextStep: () => void;
}) {
  const [newEmailTemplate, setNewEmailTemplate] = useAtom(
    newEventEmailTemplateAtom,
  );

  const form = useForm<z.infer<typeof EventEmailTemplateTriggerTypeSchema>>({
    resolver: zodResolver(EventEmailTemplateTriggerTypeSchema),
    defaultValues: {
      trigger: newEmailTemplate.trigger,
    },
  });

  useAutoSave(setNewEmailTemplate, form);

  return (
    <FormContainer
      description="Wyzwalacz"
      icon={<Zap />}
      step={"1/2"}
      title="Krok 1"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(goToNextStep)} className="space-y-8">
          <h2 className="font-semibold">Wybierz rodzaj wyzwalacza</h2>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("trigger") && (
              <TriggerTypeExplanation trigger={form.getValues("trigger")} />
            )}
          </div>
          <div className="bg-muted-foreground/25 h-[1px] w-full" />
          <div className="flex min-h-40 flex-col gap-4">
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
          </div>
          <div className="flex justify-end">
            <Button
              variant="eventGhost"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              <ArrowRight /> Przejdź dalej
            </Button>
          </div>
        </form>
      </Form>
    </FormContainer>
  );
}

export { TriggerTypeForm };
