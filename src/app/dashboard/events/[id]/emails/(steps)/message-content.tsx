"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowLeft, Loader, SquarePlus, TextIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useAutoSave } from "@/hooks/use-autosave";
import { useToast } from "@/hooks/use-toast";

import { createEventEmailTemplate } from "../actions";

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
  goToPreviousStep,
  setDialogOpen,
}: {
  eventId: string;
  goToPreviousStep: () => void;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
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

  const router = useRouter();

  const formRef = useRef<HTMLFormElement | null>(null);

  useAutoSave(setNewEmailTemplate, form);

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

      // NOTE: The order of these resets is important
      // Otherwise, 'useUnsavedAtom' will think the form is dirty
      setNewEmailTemplate({
        name: "",
        content: "",
        trigger: "manual",
        triggerValue: null,
        triggerValue2: null,
      });

      setDialogOpen(false);

      setTimeout(() => {
        router.refresh();
      }, 100);
    } else {
      toast({
        title: "Nie udało się dodać szablonu!",
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
                />
                <FormMessage>
                  {form.formState.errors.content?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <Button
              variant="eventGhost"
              onClick={goToPreviousStep}
              disabled={form.formState.isSubmitting}
            >
              <ArrowLeft /> Wróć
            </Button>
            <Button
              type="submit"
              variant="eventDefault"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader className="animate-spin" />
              ) : (
                <SquarePlus />
              )}{" "}
              Dodaj nowy szablon
            </Button>
          </div>
        </form>
      </Form>
    </FormContainer>
  );
}

export { MessageContentForm };
