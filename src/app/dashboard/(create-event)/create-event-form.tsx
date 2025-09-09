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
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useUnsavedAtom } from "@/hooks/use-unsaved";

import { AttributesForm } from "./(steps)/attributes";
import { CoorganizersForm } from "./(steps)/coorganizers";
import { GeneralInfoForm } from "./(steps)/general-info";
import { PersonalizationForm } from "./(steps)/personalization";
import { eventAtom } from "./state";

export function CreateEventForm() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);

  const { isDirty, isGuardActive, onCancel, onConfirm, setDisabled } =
    useUnsavedAtom(eventAtom);

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
      disableNavguard={() => {
        setDisabled(true);
      }}
    />,
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
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>Stwórz formularz</DialogTitle>
        </DialogHeader>
        {steps[currentStep]}
      </DialogContent>
    </Dialog>
  );
}
