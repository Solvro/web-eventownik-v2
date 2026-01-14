"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Loader2,
  SquarePlus,
  TextIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { newEventFormAtom } from "@/atoms/new-event-form-atom";
import { AttributesReorder } from "@/components/attributes-manager";
import {
  EventFormGeneralInfoSchema,
  GeneralInfoForm,
} from "@/components/forms/event-form/general-info-form";
import { FormContainer } from "@/components/forms/form-container";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useAutoSave } from "@/hooks/use-autosave";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedAtom } from "@/hooks/use-unsaved";
import { cn } from "@/lib/utils";
import type { EventAttribute, FormAttributeBase } from "@/types/attributes";

import { createEventForm } from "./actions";

type EventFormSchema = z.infer<typeof EventFormGeneralInfoSchema>;

function CreateEventFormForm({
  eventId,
  attributes,
}: {
  eventId: string;
  attributes: EventAttribute[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [newEventForm, setNewEventForm] = useAtom(newEventFormAtom);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const [includedAttributes, setIncludedAttributes] = useState<
    FormAttributeBase[]
  >(
    newEventForm.attributes.toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  );

  const { isDirty, isGuardActive, onCancel, onConfirm } =
    useUnsavedAtom(newEventFormAtom);

  const form = useForm<EventFormSchema>({
    resolver: zodResolver(EventFormGeneralInfoSchema),
    defaultValues: {
      name: newEventForm.name,
      description: newEventForm.description,
      startTime: newEventForm.startTime,
      endTime: newEventForm.endTime,
      startDate: newEventForm.startDate,
      endDate: newEventForm.endDate,
      isFirstForm: newEventForm.isFirstForm,
      isOpen: newEventForm.isOpen,
    },
  });

  useAutoSave(setNewEventForm, form);

  const steps: {
    title: string;
    description: string;
    icon: React.ReactNode;
    content: React.ReactNode;
    onSubmit: SubmitHandler<EventFormSchema>;
  }[] = [
    {
      title: "Krok 1",
      description: "Podstawowe dane",
      icon: <BookOpenText />,
      content: <GeneralInfoForm />,
      onSubmit: () => {
        setCurrentStep(1);
      },
    },
    {
      title: "Krok 2",
      description: "Wybierz atrybuty",
      icon: <TextIcon />,
      content: (
        <AttributesReorder
          attributes={attributes}
          includedAttributes={includedAttributes}
          setIncludedAttributes={setIncludedAttributes}
        />
      ),
      onSubmit: async (values: EventFormSchema) => {
        try {
          const newForm = {
            ...values,
            attributes: includedAttributes,
          };

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
              startDate: new Date(new Date().setHours(24, 0, 0, 0)),
              endDate: new Date(new Date().setHours(24, 0, 0, 0)),
              attributes: [],
            });

            form.reset();
            setIncludedAttributes([]);
            setCurrentStep(0);
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
        }
      },
    },
  ];

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open: boolean) => {
        if (open) {
          setDialogOpen(open);
        } else {
          if (isDirty || isGuardActive) {
            setAlertActive(isDirty || isGuardActive);
          } else {
            setDialogOpen(open);
          }
        }
      }}
    >
      <UnsavedChangesAlert
        active={alertActive}
        setActive={setAlertActive}
        setDialogOpen={setDialogOpen}
        onCancel={onCancel}
        onConfirm={() => {
          setCurrentStep(0);
          onConfirm();
        }}
      />
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-fit">
          <SquarePlus className="h-6 w-6" /> Stwórz formularz
        </Button>
      </DialogTrigger>
      <DialogContent className="h-full overflow-y-scroll sm:h-auto sm:max-h-[90vh] sm:overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Stwórz formularz</DialogTitle>
        </DialogHeader>
        <FormContainer
          step={`${(currentStep + 1).toString()}/${steps.length.toString()}`}
          title={steps[currentStep].title}
          description={steps[currentStep].description}
          icon={steps[currentStep].icon}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(steps[currentStep].onSubmit)}
              className="flex w-full flex-col gap-4"
            >
              {steps[currentStep].content}
              <div
                className={cn(
                  "flex w-full flex-row items-center gap-4",
                  currentStep === 0 ? "justify-end" : "justify-between",
                )}
              >
                {currentStep > 0 && (
                  <Button
                    variant="eventGhost"
                    type="button"
                    onClick={() => {
                      setCurrentStep((value) => value - 1);
                    }}
                    disabled={form.formState.isSubmitting}
                  >
                    <ArrowLeft /> Wróć
                  </Button>
                )}
                {currentStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="eventDefault"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <SquarePlus />
                    )}{" "}
                    Dodaj formularz
                  </Button>
                ) : (
                  <Button
                    variant="eventGhost"
                    className="mb-4"
                    type="submit"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        Zapisywanie danych...{" "}
                        <Loader2 className="animate-spin" />
                      </>
                    ) : (
                      <>
                        Dalej <ArrowRight />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
}

export { CreateEventFormForm };
