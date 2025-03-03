"use client";

import { SquarePlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { AttributesForm } from "./(steps)/attributes";
import { CoorganizersForm } from "./(steps)/coorganizers";
import { GeneralInfoForm } from "./(steps)/general-info";
import { PersonalizationForm } from "./(steps)/personalization";

export function CreateEventForm() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const steps = [
    <GeneralInfoForm
      goToNextStep={() => {
        setCurrentStep((value) => value + 1);
      }}
    />,
    <PersonalizationForm
      goToPreviousStep={() => {
        setCurrentStep((value) => value - 1);
      }}
      goToNextStep={() => {
        setCurrentStep((value) => value + 1);
      }}
    />,
    <CoorganizersForm
      goToPreviousStep={() => {
        setCurrentStep((value) => value - 1);
      }}
      goToNextStep={() => {
        setCurrentStep((value) => value + 1);
      }}
    />,
    <AttributesForm
      goToPreviousStep={() => {
        setCurrentStep((value) => value - 1);
      }}
    />,
  ];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
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
