"use client";

import { useAtom } from "jotai";
import { ArrowLeft, Loader, SquarePlus, TextIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FormContainer } from "@/app/dashboard/(create-event)/form-container";
import { newEventFormAtom } from "@/atoms/new-event-form-atom";
import { AttributesReorder } from "@/components/attributes-manager";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { EventAttribute, FormAttributeBase } from "@/types/attributes";

import { createEventForm } from "../actions";

function AttributesForm({
  eventId,
  attributes,
  goToPreviousStep,
  setDialogOpen,
}: {
  eventId: string;
  attributes: EventAttribute[];
  goToPreviousStep: () => void;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [newEventForm, setNewEventForm] = useAtom(newEventFormAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [includedAttributes, setIncludedAttributes] = useState<
    FormAttributeBase[]
  >(
    [...newEventForm.attributes].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    ),
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const newForm = {
        ...newEventForm,
        attributes: includedAttributes,
      };

      setNewEventForm(newForm);

      const result = await createEventForm(eventId, newForm);

      if (result.success) {
        toast({
          title: "Dodano nowy formularz",
        });

        setNewEventForm({
          isOpen: true,
          isFirstForm: false,
          description: "",
          name: "",
          slug: "",
          startTime: "12:00",
          endTime: "12:00",
          // Tomorrow, midnight
          startDate: new Date(new Date().setHours(24, 0, 0, 0)),
          endDate: new Date(new Date().setHours(24, 0, 0, 0)),
          attributes: [],
        });

        setDialogOpen(false);

        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        toast({
          title: "Nie udało się dodać formularza!",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Nie udało się dodać formularza!",
        description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Auto save implementation exclusive to this step
  useEffect(() => {
    setNewEventForm((previous) => {
      return { ...previous, attributes: includedAttributes };
    });
  }, [attributes, setNewEventForm, includedAttributes]);

  return (
    <FormContainer
      description="Wybierz atrybuty"
      icon={<TextIcon />}
      step="2/2"
      title="Krok 2"
    >
      <form onSubmit={onSubmit} className="space-y-8">
        <AttributesReorder
          attributes={attributes}
          includedAttributes={includedAttributes}
          setIncludedAttributes={setIncludedAttributes}
        />
        <div className="flex justify-between">
          <Button
            variant="eventGhost"
            onClick={goToPreviousStep}
            disabled={isSubmitting}
          >
            <ArrowLeft /> Wróć
          </Button>
          <Button type="submit" variant="eventDefault" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader className="animate-spin" />
            ) : (
              <SquarePlus />
            )}{" "}
            Dodaj formularz
          </Button>
        </div>
      </form>
    </FormContainer>
  );
}

export { AttributesForm };
