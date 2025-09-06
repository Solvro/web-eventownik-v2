"use client";

import { SquarePlus } from "lucide-react";
import { useState } from "react";

import { newEventEmailTemplateAtom } from "@/atoms/new-email-template-atom";
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
import type { EventForm } from "@/types/forms";

import { MessageContentForm } from "./(steps)/message-content";
import { TriggerTypeForm } from "./(steps)/trigger-type";

function CreateEmailTemplateForm({
  eventId,
  eventAttributes,
  eventForms,
}: {
  eventId: string;
  eventAttributes: EventAttribute[];
  eventForms: EventForm[];
}) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);

  const { isDirty, isGuardActive, onCancel, onConfirm } = useUnsavedAtom(
    newEventEmailTemplateAtom,
  );

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
          <SquarePlus className="h-6 w-6" /> Stwórz szablon
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>Stwórz szablon</DialogTitle>
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
            <TriggerTypeForm
              eventAttributes={eventAttributes}
              eventForms={eventForms}
              goToNextStep={() => {
                setCurrentStep(1);
              }}
            />
          )}
          {currentStep === 1 && (
            <MessageContentForm
              eventId={eventId}
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

export { CreateEmailTemplateForm };
