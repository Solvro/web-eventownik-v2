"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { getHours, getMinutes } from "date-fns";
import { useAtom } from "jotai";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import type z from "zod";

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
import { toast } from "@/hooks/use-toast";
import { useUnsavedAtom } from "@/hooks/use-unsaved";
import { cn, getBase64FromUrl } from "@/lib/utils";

import { AttributesForm } from "./(steps)/attributes";
import {
  CoorganizersForm,
  EventCoorganizersFormSchema,
} from "./(steps)/coorganizers";
import {
  EventGeneralInfoSchema,
  GeneralInfoForm,
} from "./(steps)/general-info";
import {
  EventPersonalizationFormSchema,
  PersonalizationForm,
} from "./(steps)/personalization";
import { isSlugTaken, saveEvent } from "./actions";
import { FormContainer } from "./form-container";
import { eventAtom } from "./state";

export function CreateEventForm() {
  const router = useRouter();
  const [event, setEvent] = useAtom(eventAtom);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);

  const { isDirty, isGuardActive, onCancel, onConfirm, setDisabled } =
    useUnsavedAtom(eventAtom);

  type EventSchema = z.infer<typeof EventGeneralInfoSchema> &
    z.infer<typeof EventPersonalizationFormSchema> &
    z.infer<typeof EventCoorganizersFormSchema>;

  // Per-step resolvers you said you already have
  const stepResolvers: Resolver<EventSchema>[] = [
    zodResolver(EventGeneralInfoSchema) as unknown as Resolver<EventSchema>,
    zodResolver(
      EventPersonalizationFormSchema,
    ) as unknown as Resolver<EventSchema>,
    zodResolver(
      EventCoorganizersFormSchema,
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
      coorganizers: [],
    },
  });

  const steps: {
    title: string;
    description: string;
    icon: React.ReactNode;
    content: React.ReactNode;
    onSubmit?: (values: EventSchema) => void;
    resolver?: Resolver<EventSchema>;
  }[] = [
    {
      title: "Krok 1",
      description: "Podaj podstawowe informacje o wydarzeniu",
      icon: <CalendarIcon />,
      content: <GeneralInfoForm />,
      onSubmit: (values: EventSchema) => {
        const startDate = values.startDate;
        const endDate = values.endDate;
        startDate.setHours(Number.parseInt(values.startTime.split(":")[0]));
        startDate.setMinutes(Number.parseInt(values.startTime.split(":")[1]));
        endDate.setHours(Number.parseInt(values.endTime.split(":")[0]));
        endDate.setMinutes(Number.parseInt(values.endTime.split(":")[1]));

        if (startDate < new Date()) {
          form.setError("startDate", {
            message: "Data rozpoczęcia nie może być w przeszłości.",
          });
          return;
        }
        if (endDate < startDate) {
          form.setError("endDate", {
            message: "Data zakończenia musi być po dacie rozpoczęcia.",
          });
          return;
        }
        setEvent((previous) => {
          return {
            ...previous,
            startDate,
            endDate,
          };
        });
        form.setValue(
          "slug",
          event.slug === ""
            ? event.name.toLowerCase().replaceAll(/\s+/g, "-")
            : event.slug,
        );
        setCurrentStep((value) => value + 1);
      },
      resolver: zodResolver(
        EventGeneralInfoSchema,
      ) as unknown as Resolver<EventSchema>,
    },
    {
      title: "Krok 2",
      description: "Spersonalizuj wydarzenie",
      icon: <SettingsIcon />,
      content: <PersonalizationForm />,
      onSubmit: async (values: EventSchema) => {
        if (!(await form.trigger())) {
          return { success: false, event: null };
        }
        /**
         * before going to the next step,
         * we have to check if submitted slug is not already used
         */
        const slugTaken = await isSlugTaken(values.slug);
        if (slugTaken) {
          form.setError("slug", {
            message: "Ten slug jest już zajęty.",
          });
          return;
        }
        setCurrentStep((value) => value + 1);
      },
      resolver: zodResolver(
        EventPersonalizationFormSchema,
      ) as unknown as Resolver<EventSchema>,
    },
    {
      title: "Krok 3",
      description: "Dodaj współorganizatorów",
      icon: <Users />,
      content: <CoorganizersForm />,
      onSubmit: () => {
        setCurrentStep((value) => value + 1);
      },
      resolver: zodResolver(
        EventCoorganizersFormSchema,
      ) as unknown as Resolver<EventSchema>,
    },
    {
      title: "Krok 4",
      description: "Dodaj atrybuty",
      icon: <TextIcon />,
      content: <AttributesForm />,
    },
  ];

  useAutoSave(setEvent, form);

  async function createEvent() {
    setLoading(true);
    const base64Image = event.image.startsWith("blob:")
      ? await getBase64FromUrl(event.image)
      : event.image;
    const newEventObject = { ...event, image: base64Image };
    try {
      const result = await saveEvent(newEventObject);
      if ("errors" in result) {
        toast({
          variant: "destructive",
          title: "Nie udało się dodać wydarzenia!",
          description: "Spróbuj utworzyć wydarzenie ponownie",
        });
      } else {
        URL.revokeObjectURL(event.image);

        toast({
          title: "Dodano nowe wydarzenie",
        });

        setEvent({
          name: "",
          description: "",
          // Tomorrow, midnight
          startDate: new Date(new Date().setHours(24, 0, 0, 0)),
          endDate: new Date(new Date().setHours(24, 0, 0, 0)),
          location: "",
          organizer: "",
          image: "",
          color: "#3672fd",
          participantsNumber: 1,
          socialMediaLinks: [],
          slug: "",
          coorganizers: [],
          attributes: [],
        });

        // Disable the unsaved changes guard
        setDisabled(true);

        setTimeout(() => {
          router.push(`/dashboard/events/${result.id}`);
        }, 200);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Brak połączenia z serwerem",
        description: "Sprawdź swoje połączenie z internetem",
      });
    }
    setLoading(false);
  }

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
          {steps[currentStep].onSubmit == null ? (
            <div className="flex w-full flex-col gap-4">
              {steps[currentStep].content}
              <div className="flex flex-row items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentStep((value) => value - 1);
                  }}
                >
                  <ArrowLeft /> Wróć
                </Button>

                {currentStep === steps.length - 1 ? (
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
                ) : (
                  <Button
                    className="w-min"
                    variant="ghost"
                    onClick={() => {
                      setCurrentStep((value) => value + 1);
                    }}
                  >
                    Dalej <ArrowRight />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                className="flex w-full flex-col items-end gap-4"
                onSubmit={form.handleSubmit(steps[currentStep].onSubmit)}
              >
                {steps[currentStep].content}{" "}
                <div
                  className={cn(
                    "flex w-full flex-row items-center gap-4",
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
                  <Button
                    className="w-min"
                    variant="ghost"
                    disabled={form.formState.isSubmitting}
                    type="submit"
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
                </div>
              </form>
            </Form>
          )}
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
}
