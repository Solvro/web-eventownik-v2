"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mention } from "@tiptap/extension-mention";
import { mergeAttributes } from "@tiptap/react";
import { useAtom } from "jotai";
import { ArrowLeft, Loader, Save, TextIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormContainer } from "@/app/dashboard/(create-event)/form-container";
import { newEventEmailTemplateAtom } from "@/atoms/new-email-template-atom";
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
import { useToast } from "@/hooks/use-toast";
import { MESSAGE_TAGS, getSuggestionOptions } from "@/lib/extensions/tags";
import type { EventAttribute } from "@/types/attributes";

import { createEventEmailTemplate } from "../actions";

// TODO: Following disable statements are not needed in TipTap V3, but we're using V2 for now
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

const EventEmailTemplateContentSchema = z.object({
  name: z.string().nonempty({ message: "Tytuł nie może być pusty." }),
  content: z.string().nonempty({ message: "Treść nie może być pusta." }),
});

function getTitlePlaceholder(trigger: string) {
  switch (trigger) {
    case "participant_registered": {
      return "Dziękujemy za rejestrację!";
    }
    case "participant_deleted": {
      return "Usunięto Cię z listy uczestników";
    }
    case "manual": {
      return "Aktualizacja regulaminu wydarzenia";
    }
    case "form_filled": {
      return "Dziękujemy za wypełnienie formularza!";
    }
    case "attribute_changed": {
      return "Otrzymaliśmy Twoją wpłatę";
    }
    default: {
      return "Nowa wiadomość od organizatorów";
    }
  }
}

function MessageContentForm({
  eventId,
  eventAttributes,
  goToPreviousStep,
}: {
  eventId: string;
  eventAttributes: EventAttribute[];
  goToPreviousStep: () => void;
}) {
  const [newEmailTemplate, setNewEmailTemplate] = useAtom(
    newEventEmailTemplateAtom,
  );

  const { toast } = useToast();

  const form = useForm<z.infer<typeof EventEmailTemplateContentSchema>>({
    resolver: zodResolver(EventEmailTemplateContentSchema),
    defaultValues: {
      name: newEmailTemplate.name,
      content: newEmailTemplate.content,
    },
  });

  const formRef = useRef<HTMLFormElement | null>(null);

  function saveEdits() {
    setNewEmailTemplate((previous) => {
      return { ...previous, ...form.getValues() };
    });
  }

  async function onSubmit(
    values: z.infer<typeof EventEmailTemplateContentSchema>,
  ) {
    const result = await createEventEmailTemplate(eventId, {
      ...newEmailTemplate,
      ...values,
    });

    if (result.success) {
      toast({
        title: "Dodano nowy szablon",
      });

      setNewEmailTemplate({
        content: "",
        name: "",
        trigger: "manual",
        triggerValue: null,
        triggerValue2: null,
      });

      // 'router.refresh()' doesn't work here for some reason - using native method instead
      location.reload();
    } else {
      toast({
        title: "Nie udało się dodać szablonu",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  const availableTags = [
    ...MESSAGE_TAGS,
    ...eventAttributes.map((attribute) => {
      return {
        title: attribute.name,
        description: `Pokazuje wartość atrybutu '${attribute.name}'`,
        // NOTE: Why 'attribute.slug' can be null?
        value: `/participant_${attribute.slug ?? ""}`,
        color: "#FFFFFF",
      };
    }),
  ] satisfies typeof MESSAGE_TAGS;

  const getTagColor = (tagValue: string) => {
    return availableTags.find((tag) => tag.value === tagValue)?.color;
  };

  return (
    <FormContainer
      description="Zawartość wiadomości"
      icon={<TextIcon />}
      step="2/2"
      title="Krok 2"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          ref={formRef}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tytuł wiadomości</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={getTitlePlaceholder(newEmailTemplate.trigger)}
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
                  extensions={[
                    Mention.configure({
                      suggestion: {
                        ...getSuggestionOptions(availableTags),
                      },
                      HTMLAttributes: {
                        class: "text-foreground px-2 py-[1px] rounded-md",
                      },
                      renderHTML({ options, node }) {
                        return [
                          "span",
                          mergeAttributes(
                            {
                              style: `background-color: ${getTagColor(node.attrs.id as string) ?? "var(--accent)"}`,
                            },
                            options.HTMLAttributes,
                          ),
                          node.attrs.label,
                        ];
                      },
                    }),
                  ]}
                />
                <FormMessage>
                  {form.formState.errors.content?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                saveEdits();
                goToPreviousStep();
              }}
              disabled={form.formState.isSubmitting}
            >
              <ArrowLeft /> Wróć
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader className="animate-spin" />
              ) : (
                <Save />
              )}{" "}
              Zapisz
            </Button>
          </div>
        </form>
      </Form>
    </FormContainer>
  );
}

export { MessageContentForm };
