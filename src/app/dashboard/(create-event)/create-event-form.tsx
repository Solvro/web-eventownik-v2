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

import { AttributesForm } from "./(steps)/attributes";
import { CoorganizersForm } from "./(steps)/coorganizers";
import { GeneralInfoForm } from "./(steps)/general-info";
import { PersonalizationForm } from "./(steps)/personalization";
import { eventAtom } from "./event-state";
import { FormContainer } from "./form-container";
import { formStateAtom } from "./form-state";

export function CreateEventForm() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const formState = useAtomValue(formStateAtom(currentStep));

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
      content: (
        <GeneralInfoForm
          goToNextStep={() => {
            setCurrentStep((value) => value + 1);
          }}
        />
      ),
    },
    {
      title: "Krok 2",
      description: "Spersonalizuj wydarzenie",
      icon: <SettingsIcon />,
      content: (
        <PersonalizationForm
          goToPreviousStep={() => {
            setCurrentStep((value) => value - 1);
          }}
          goToNextStep={() => {
            setCurrentStep((value) => value + 1);
          }}
        />
      ),
    },
    {
      title: "Krok 3",
      description: "Dodaj współorganizatorów",
      icon: <Users />,
      content: (
        <CoorganizersForm
          goToPreviousStep={() => {
            setCurrentStep((value) => value - 1);
          }}
          goToNextStep={() => {
            setCurrentStep((value) => value + 1);
          }}
        />
      ),
    },
    {
      title: "Krok 4",
      description: "Dodaj atrybuty",
      icon: <TextIcon />,
      content: (
        <AttributesForm
          goToPreviousStep={() => {
            setCurrentStep((value) => value - 1);
          }}
          disableNavguard={() => {
            setDisabled(true);
          }}
        />
      ),
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
            <div className="flex flex-row items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentStep((value) => value - 1);
                }}
                disabled={formState.submitting}
              >
                <ArrowLeft /> Wróć
              </Button>
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
            </div>
          </div>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
}
