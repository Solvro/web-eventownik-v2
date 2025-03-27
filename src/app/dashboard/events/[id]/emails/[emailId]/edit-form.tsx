"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lightbulb, Save, Text, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Editor } from "@/components/editor";
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
import { useToast } from "@/hooks/use-toast";
import { EMAIL_TRIGGERS } from "@/lib/emails";
import type { SingleEventEmail } from "@/types/emails";

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
    <div className="border-primary/25 flex max-w-lg grow flex-col gap-2 rounded-md border p-4">
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
                <FormLabel>ID formularza</FormLabel>
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
                <FormLabel>ID atrybutu</FormLabel>
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

function EventEmailEditForm({
  eventId,
  emailToEdit,
}: {
  eventId: string;
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
        title: "Szablon został zaktualizowany",
      });
      location.reload();
    } else {
      toast({
        title: "Nie udało się zaktualizować szablonu",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-accent flex items-center gap-4 rounded-md p-4 text-2xl font-semibold">
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
              form={form}
            />
          </div>
          <div className="bg-accent flex items-center gap-4 rounded-md p-4 text-2xl font-semibold">
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
                <Editor
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
        <Button type="submit" disabled={form.formState.isSubmitting}>
          <Save /> Zapisz zmiany
        </Button>
      </form>
    </Form>
  );
}

export { EventEmailEditForm };
