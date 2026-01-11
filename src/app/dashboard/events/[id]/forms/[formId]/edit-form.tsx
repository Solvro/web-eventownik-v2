"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Save } from "lucide-react";
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
import type { EventAttribute, FormAttributeBase } from "@/types/attributes";
import type { EventForm } from "@/types/forms";

import { updateEventForm } from "../actions";

interface EventFormEditFormProps {
  eventId: string;
  formToEdit: EventForm;
  eventAttributes: EventAttribute[];
}

function EventFormEditForm({
  eventId,
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
      startTime: `${new Date(formToEdit.startDate).getHours().toString().padStart(2, "0")}:${new Date(formToEdit.startDate).getMinutes().toString().padStart(2, "0")}`,
      endTime: `${new Date(formToEdit.endDate).getHours().toString().padStart(2, "0")}:${new Date(formToEdit.endDate).getMinutes().toString().padStart(2, "0")}`,
      startDate: new Date(formToEdit.startDate),
      endDate: new Date(formToEdit.endDate),
      isFirstForm: formToEdit.isFirstForm,
      isOpen: formToEdit.isOpen,
    },
  });
  const { toast } = useToast();

  const { isGuardActive, onCancel, onConfirm } = useUnsavedForm(
    form.formState.isDirty,
  );

  async function onSubmit(values: z.infer<typeof EventFormGeneralInfoSchema>) {
    try {
      const result = await updateEventForm(eventId, formToEdit.id.toString(), {
        ...formToEdit,
        ...values,
        attributes: includedAttributes,
      });

      if (result.success) {
        toast({
          title: "Zapisano zmiany w formularzu",
        });
        form.reset(values);
      } else {
        toast({
          title: "Nie udało się zapisać zmian w formularzu!",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating event form:", error);
      toast({
        title: "Nie udało się zapisać zmian w formularzu!",
        description: "Wystąpił błąd podczas aktualizacji formularza.",
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
          Zapisz
        </Button>
      </form>
    </Form>
  );
}

export { EventFormEditForm };
