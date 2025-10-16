"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { getHours, getMinutes } from "date-fns";
import { useAtom, useAtomValue } from "jotai";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  Loader2,
  SettingsIcon,
  SquarePlus,
  TextIcon,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useUnsavedAtom } from "@/hooks/use-unsaved";
import { cn } from "@/lib/utils";

import { AttributesForm } from "./(steps)/attributes";
import { CoorganizersForm } from "./(steps)/coorganizers";
import {
  EventGeneralInfoSchema,
  GeneralInfoForm,
} from "./(steps)/general-info";
import {
  EventPersonalizationFormSchema,
  PersonalizationForm,
} from "./(steps)/personalization";
import { FormContainer } from "./form-container";
import { eventAtom } from "./state";

export function CreateEventForm() {
  const [event, setEvent] = useAtom(eventAtom);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);

  const { isDirty, isGuardActive, onCancel, onConfirm, setDisabled } =
    useUnsavedAtom(eventAtom);

  const steps: {
    title: string;
    description: string;
    icon: React.ReactNode;
    content: React.ReactNode;
  }[] = [
    {
      title: "Krok 1",
      description: "Podaj podstawowe informacje o wydarzeniu",
      icon: <CalendarIcon />,
      content: <GeneralInfoForm />,
    },
    {
      title: "Krok 2",
      description: "Spersonalizuj wydarzenie",
      icon: <SettingsIcon />,
      content: <PersonalizationForm />,
    },
    {
      title: "Krok 3",
      description: "Dodaj współorganizatorów",
      icon: <Users />,
      content: <CoorganizersForm />,
    },
    {
      title: "Krok 4",
      description: "Dodaj atrybuty",
      icon: <TextIcon />,
      content: (
        <AttributesForm
          disableNavguard={() => {
            setDisabled(true);
          }}
        />
      ),
    },
  ];

  type EventSchema = z.infer<typeof EventGeneralInfoSchema> &
    z.infer<typeof EventPersonalizationFormSchema>;

  // Per-step resolvers you said you already have
  const stepResolvers: Resolver<EventSchema>[] = [
    zodResolver(EventGeneralInfoSchema) as unknown as Resolver<EventSchema>,
    zodResolver(
      EventPersonalizationFormSchema,
    ) as unknown as Resolver<EventSchema>,
  ];

  const resolver: Resolver<EventSchema> = async (values, context, options) => {
    const stepResolver =
      stepResolvers[currentStep] ??
      (() => ({
        values,
        errors: {},
      }));
    // Notice: we must call the inner resolver and await its result
    return await stepResolver(values, context, options);
  };

  const form = useForm<EventSchema>({
    resolver,
    defaultValues: {
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      startTime: `${getHours(event.startDate).toString()}:${getMinutes(event.startDate).toString().padStart(2, "0")}`,
      endDate: event.endDate,
      endTime: `${getHours(event.endDate).toString()}:${getMinutes(event.endDate).toString().padStart(2, "0")}`,
      location: event.location,
      organizer: event.organizer,
      image: event.image,
      color: event.color,
      participantsNumber: event.participantsNumber,
      socialMediaLinks: event.socialMediaLinks,
      slug:
        event.slug === ""
          ? event.name.toLowerCase().replaceAll(/\s+/g, "-")
          : event.slug,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "socialMediaLinks",
    control: form.control,
  });

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
        <Button variant="outline">
          <SquarePlus /> Stwórz wydarzenie
        </Button>
      </DialogTrigger>
      <DialogContent className="h-full overflow-y-scroll sm:h-auto sm:overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Stwórz formularz</DialogTitle>
        </DialogHeader>
        <FormContainer
          step={`${(currentStep + 1).toString()}/${steps.length.toString()}`}
          title={steps[currentStep].title}
          description={steps[currentStep].description}
          icon={steps[currentStep].icon}
        >
          <div className="flex w-full flex-col gap-4">
            {steps[currentStep].content}
            <div
              className={cn(
                "flex flex-row items-center gap-4",
                currentStep === 0 ? "justify-end" : "justify-between",
              )}
            >
              {currentStep !== 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentStep((value) => value - 1);
                  }}
                  disabled={form.formState.isSubmitting}
                >
                  <ArrowLeft /> Wróć
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  className="w-min"
                  variant="ghost"
                  disabled={form.formState.isSubmitting}
                  type="submit"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      Zapisywanie danych... <Loader2 className="animate-spin" />
                    </>
                  ) : (
                    <>
                      Dalej <ArrowRight />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="w-min"
                  onClick={createEvent}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <SquarePlus />
                  )}{" "}
                  Dodaj wydarzenie
                </Button>
              )}
            </div>
          </div>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
}
