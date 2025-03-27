"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowLeft, Loader, Save, TextIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormContainer } from "@/app/dashboard/(create-event)/form-container";
import { newEventEmailTemplateAtom } from "@/atoms/new-email-template-atom";
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
import { useToast } from "@/hooks/use-toast";

import { createEventEmailTemplate } from "../actions";

const EventEmailTemplateContentSchema = z.object({
  name: z.string().nonempty({ message: "Tytuł nie może być pusty." }),
  content: z.string().nonempty({ message: "Treść nie może być pusta." }),
});

function MessageContentForm({
  eventId,
  goToPreviousStep,
}: {
  eventId: string;
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
