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
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useUnsavedAtom } from "@/hooks/use-unsaved";
import type { EventAttribute } from "@/types/attributes";

import { AttributesForm } from "./(steps)/attributes";
import { GeneralInfoForm } from "./(steps)/general-info";

function CreateEventFormForm({
  eventId,
  attributes,
}: {
  eventId: string;
  attributes: EventAttribute[];
}) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);

  const { isDirty, isGuardActive, onCancel, onConfirm } =
    useUnsavedAtom(newEventFormAtom);

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
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <SquarePlus className="h-6 w-6" /> Stwórz formularz
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>Stwórz formularz</DialogTitle>
        </DialogHeader>
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
        <div className="flex flex-col gap-4">
          {currentStep === 0 && (
            <GeneralInfoForm
              goToNextStep={() => {
                setCurrentStep(1);
              }}
            />
          )}
          {currentStep === 1 && (
            <AttributesForm
              eventId={eventId}
              attributes={attributes}
              goToPreviousStep={() => {
                setCurrentStep(0);
              }}
              setDialogOpen={setDialogOpen}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CreateEventFormForm };
