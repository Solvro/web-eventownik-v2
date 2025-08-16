"use client";

import { SquarePlus } from "lucide-react";
import { useState } from "react";

import { newEventEmailTemplateAtom } from "@/atoms/new-email-template-atom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UnsavedIndicator } from "@/components/unsaved-indicator";
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
  const isDirty = useUnsavedAtom(newEventEmailTemplateAtom);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button className="border-muted text-muted-foreground relative flex h-64 w-64 items-center justify-center gap-2 rounded-md border border-dotted p-4">
          <div className="relative flex gap-2">
            <SquarePlus className="h-6 w-6" /> Stwórz szablon
            {isDirty && !dialogOpen ? (
              <UnsavedIndicator markerOffset="-0.25" pingOffset="-0.75" />
            ) : null}
          </div>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>Stwórz szablon</DialogTitle>
        </DialogHeader>
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
