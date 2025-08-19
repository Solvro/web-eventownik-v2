"use client";

import { SquarePlus } from "lucide-react";
import { useState } from "react";

import { newEventFormAtom } from "@/atoms/new-event-form-atom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUnsavedAtom } from "@/hooks/use-unsaved";

import { AttributesForm } from "./(steps)/attributes";
import { CoorganizersForm } from "./(steps)/coorganizers";
import { GeneralInfoForm } from "./(steps)/general-info";
import { PersonalizationForm } from "./(steps)/personalization";

export function CreateEventForm() {
  const [currentStep, setCurrentStep] = useState<number>(0);

  useUnsavedAtom(newEventFormAtom);

  const steps = [
    <GeneralInfoForm
      key={0}
      goToNextStep={() => {
        setCurrentStep((value) => value + 1);
      }}
    />,
    <PersonalizationForm
      key={1}
      goToPreviousStep={() => {
        setCurrentStep((value) => value - 1);
      }}
      goToNextStep={() => {
        setCurrentStep((value) => value + 1);
      }}
    />,
    <CoorganizersForm
      key={2}
      goToPreviousStep={() => {
        setCurrentStep((value) => value - 1);
      }}
      goToNextStep={() => {
        setCurrentStep((value) => value + 1);
      }}
    />,
    <AttributesForm
      key={3}
      goToPreviousStep={() => {
        setCurrentStep((value) => value - 1);
      }}
    />,
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <SquarePlus /> Stwórz wydarzenie
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>Stwórz formularz</DialogTitle>
        </DialogHeader>
        {steps[currentStep]}
      </DialogContent>
    </Dialog>
  );
}
