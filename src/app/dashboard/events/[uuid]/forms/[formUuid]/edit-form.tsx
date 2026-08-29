"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AttributesReorder } from "@/components/attributes-manager";
import {
  EventFormGeneralInfoSchema,
  GeneralInfoForm,
} from "@/components/forms/event-form/general-info-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedForm } from "@/hooks/use-unsaved";
import { translateOrFallback } from "@/i18n/utils";
import type { EventAttribute, FormAttributeBase } from "@/types/attributes";
import type { EventForm } from "@/types/forms";

import { updateEventForm } from "../actions";

interface EventFormEditFormProps {
  eventUuid: string;
  formToEdit: EventForm;
  eventAttributes: EventAttribute[];
}

function EventFormEditForm({
  eventUuid,
  formToEdit,
  eventAttributes,
}: EventFormEditFormProps) {
  const [includedAttributes, setIncludedAttributes] = useState<
    FormAttributeBase[]
  >(formToEdit.attributes.toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  const form = useForm<z.infer<typeof EventFormGeneralInfoSchema>>({
    resolver: zodResolver(EventFormGeneralInfoSchema),
    defaultValues: {
      name: formToEdit.name,
      description: formToEdit.description,
      openTime:
        formToEdit.openDate === null
          ? "12:00"
          : format(new Date(formToEdit.openDate), "HH:mm"),
      closeTime:
        formToEdit.closeDate === null
          ? "12:00"
          : format(new Date(formToEdit.closeDate), "HH:mm"),
      openDate: new Date(
        formToEdit.openDate ?? new Date().setHours(24, 0, 0, 0),
      ),
      closeDate:
        formToEdit.closeDate === null
          ? formToEdit.openDate === null
            ? new Date(new Date().setHours(48, 0, 0, 0))
            : new Date(
                new Date(formToEdit.openDate).setDate(
                  new Date(formToEdit.openDate).getDate() + 1,
                ),
              )
          : new Date(formToEdit.closeDate),
      isFirstForm: formToEdit.isFirstForm,
      isOpen: formToEdit.isOpen,
      openCondition: formToEdit.openCondition,
    },
  });
  const { toast } = useToast();
  const t = useTranslations("Dashboard");
  const tEventDetails = useTranslations("EventDetails");

  const { isGuardActive, onCancel, onConfirm } = useUnsavedForm(
    form.formState.isDirty,
  );

  async function onSubmit(values: z.infer<typeof EventFormGeneralInfoSchema>) {
    try {
      const result = await updateEventForm(eventUuid, formToEdit.uuid, {
        ...formToEdit,
        ...values,
        attributes: includedAttributes,
      });

      if (result.success) {
        toast({
          title: t("formChangesSaved"),
        });
        form.reset(values);
      } else {
        toast({
          title: t("failedToSaveFormChanges"),
          description:
            result.error?.message ??
            translateOrFallback(
              tEventDetails,
              result.error?.key,
              result.error?.values,
            ),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating event form:", error);
      toast({
        title: t("failedToSaveFormChanges"),
        description: t("formUpdateError"),
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
        <div className="flex max-w-xl flex-col gap-8">
          <GeneralInfoForm />
          <AttributesReorder
            attributes={eventAttributes}
            includedAttributes={includedAttributes}
            setIncludedAttributes={setIncludedAttributes}
          />
        </div>
        <Button type="submit" variant="eventDefault">
          {form.formState.isSubmitting ? (
            <Loader className="animate-spin" />
          ) : (
            <Save />
          )}{" "}
          {t("save")}
        </Button>
      </form>
    </Form>
  );
}

export { EventFormEditForm };
