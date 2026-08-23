"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowLeft, Loader, SquarePlus, TextIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { newEventEmailTemplateAtom } from "@/atoms/new-email-template-atom";
import { WysiwygEditor } from "@/components/editor";
import { FormContainer } from "@/components/forms/form-container";
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
import { translateOrFallback } from "@/i18n/translate-or-fallback";
import { getAttributeTags, getFormTags } from "@/lib/message-tags/tag-builders";
import { setupSuggestions } from "@/lib/message-tags/tag-suggestions";
import type { Attribute } from "@/types/attributes";
import type { EventForm } from "@/types/forms";

import { createEventEmail } from "../actions";

const EventEmailTemplateContentSchema = z.object({
  name: z.string().nonempty({ message: "subjectRequired" }),
  content: z.string().refine((value) => value.trim() !== "<p></p>", {
    message: "bodyRequired",
  }),
});

type EventEmailTemplateErrors = "subjectRequired" | "bodyRequired";

export function getTitlePlaceholder(
  trigger: string,
  t: ReturnType<typeof useTranslations>,
) {
  switch (trigger) {
    case "participant_registered": {
      return t("thankYouForRegistration");
    }
    case "participant_deleted": {
      return t("removedFromParticipants");
    }
    case "manual": {
      return t("eventTermsUpdated");
    }
    case "form_filled": {
      return t("formSubmissionThankYou");
    }
    // NOTE: Commented out because this trigger is not yet implemented on the backend.
    // Uncomment when the backend supports this feature.
    // case "attribute_changed": {
    //   return "Otrzymaliśmy Twoją wpłatę";
    // }
    default: {
      return t("newOrganizerMessage");
    }
  }
}

function MessageContentForm({
  eventUuid,
  attributes,
  eventForms,
  goToPreviousStep,
  setDialogOpen,
  setCurrentStep,
}: {
  eventUuid: string;
  attributes: Attribute[];
  eventForms: EventForm[];
  goToPreviousStep: () => void;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const t = useTranslations("EventDetails");
  const tMessageTags = useTranslations("MessageTags");

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
    const result = await createEventEmail({
      eventUuid,
      emailTemplate: {
        ...newEmailTemplate,
        ...values,
        // NOTE: Simple emails have no schema
        schema: null,
      },
    });

    if (result.success) {
      toast({
        title: t("templateAdded"),
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
      setCurrentStep(0);

      setTimeout(() => {
        router.refresh();
      }, 100);
    } else {
      toast({
        title: t("templateAddFailed"),
        description: translateOrFallback(
          t,
          result.error?.key,
          result.error?.values,
        ),
        variant: "destructive",
      });
    }
  }

  return (
    <FormContainer
      description={t("messageContent")}
      icon={<TextIcon />}
      step="2/2"
      title={t("step", { number: 2 })}
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
                <FormLabel>{t("messageSubject")}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={getTitlePlaceholder(
                      newEmailTemplate.trigger,
                      t,
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {translateOrFallback(
                    t,
                    form.formState.errors.name
                      ?.message as EventEmailTemplateErrors,
                  )}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("messageBody")}
                  <span className="text-muted-foreground ml-2 text-xs">
                    {t("useShiftEnterHint")}
                  </span>
                </FormLabel>
                <WysiwygEditor
                  content={form.getValues("content")}
                  onChange={field.onChange}
                  extensions={setupSuggestions(
                    [
                      ...getAttributeTags(attributes, tMessageTags),
                      ...getFormTags(eventForms, tMessageTags),
                    ],
                    tMessageTags,
                  )}
                  isEmailEditor
                  placeholder={t("writeMessage")}
                />
                <FormMessage className="text-sm text-red-500">
                  {translateOrFallback(
                    t,
                    form.formState.errors.content
                      ?.message as EventEmailTemplateErrors,
                  )}
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
              <ArrowLeft /> {t("back")}
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
              {t("addTemplate")}
            </Button>
          </div>
        </form>
      </Form>
    </FormContainer>
  );
}

export { MessageContentForm };
