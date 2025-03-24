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
import { EMAIL_TRIGGERS } from "@/lib/emails";

const EventEmailTemplateTriggerTypeSchema = z.object({
  trigger: z.enum(EMAIL_TRIGGERS.map((t) => t.value) as [string, ...string[]]),
  triggerValue: z.string(),
  triggerValue2: z.string(),
});

function TriggerTypeExplanation({ trigger }: { trigger: string }) {
  const target = EMAIL_TRIGGERS.find((t) => t.value === trigger);

  if (target === undefined) {
    return null;
  }

  return (
    <div className="flex max-w-lg grow flex-col gap-2 rounded-md border border-primary/25 p-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4" /> Wyjaśnienie
      </div>
      <p className="text-sm">{target.description}</p>
    </div>
  );
}

function TriggerConfigurationInputs({
  trigger,
  form,
}: {
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
        <p className="my-2 text-sm text-muted-foreground">
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
                <FormLabel>Slug formularza</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="formularz_rejestracyjny"
                    {...field}
                  />
                </FormControl>
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
                <FormLabel>Slug atrybutu</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="czy_zaplacil" {...field} />
                </FormControl>
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

function TriggerTypeForm({ goToNextStep }: { goToNextStep: () => void }) {
  const [newEmailTemplate, setNewEmailTemplate] = useAtom(
    newEventEmailTemplateAtom,
  );

  const form = useForm<z.infer<typeof EventEmailTemplateTriggerTypeSchema>>({
    resolver: zodResolver(EventEmailTemplateTriggerTypeSchema),
    defaultValues: {
      trigger: newEmailTemplate.trigger,
    },
  });

  function onSubmit(
    values: z.infer<typeof EventEmailTemplateTriggerTypeSchema>,
  ) {
    setNewEmailTemplate((previous) => {
      return { ...previous, ...values };
    });
    goToNextStep();
  }

  return (
    <FormContainer
      description="Wyzwalacz"
      icon={<Zap />}
      step={"1/2"}
      title="Krok 1"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          className="flex items-center space-x-3 space-y-0"
                          key={trigger.value}
                        >
                          <FormControl>
                            <RadioGroupItem value={trigger.value} />
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
          <div className="h-[1px] w-full bg-muted-foreground/25" />
          <div className="flex min-h-[216px] flex-col gap-4">
            <h2 className="font-semibold">Skonfiguruj wyzwalacz</h2>
            <div className="flex flex-col gap-8">
              <TriggerConfigurationInputs
                trigger={form.getValues("trigger")}
                form={form}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              <ArrowRight /> Dalej
            </Button>
          </div>
        </form>
      </Form>
    </FormContainer>
  );
}

export { TriggerTypeForm };
