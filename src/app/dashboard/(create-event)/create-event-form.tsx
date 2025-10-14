"use client";

import { useAtomValue } from "jotai";
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
import { useForm } from "react-hook-form";

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
import { GeneralInfoForm } from "./(steps)/general-info";
import { PersonalizationForm } from "./(steps)/personalization";
import { FormContainer } from "./form-container";
import { eventAtom } from "./state";

export function CreateEventForm() {
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
    z.infer<typeof EventPersonalizationSchema> &
    z.infer<typeof EventCoorganizersSchema> &
    z.infer<typeof EventAttributesSchema>;
  const form = useForm;

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
                  disabled={formState.submitting}
                >
                  <ArrowLeft /> Wróć
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  className="w-min"
                  variant="ghost"
                  disabled={formState.submitting}
                  type="submit"
                >
                  {formState.submitting ? (
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
