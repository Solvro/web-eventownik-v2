"use client";

import { SquarePlus } from "lucide-react";
import { useState } from "react";

import { newEventFormAtom } from "@/atoms/new-event-form-atom";
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
  const isDirty = useUnsavedAtom(newEventFormAtom);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button className="border-muted text-muted-foreground flex h-64 w-64 items-center justify-center gap-2 rounded-md border border-dotted p-4">
          <div className="relative flex gap-2">
            <SquarePlus className="h-6 w-6" /> Stwórz formularz
            {isDirty && !dialogOpen ? (
              <UnsavedIndicator offset="-0.25" />
            ) : null}
          </div>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>Stwórz formularz</DialogTitle>
        </DialogHeader>
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
