"use client";

import { SquarePlus } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { AttributesForm } from "./(steps)/attributes";
import { GeneralInfoForm } from "./(steps)/general-info";

interface EventAttribute {
  id: number;
  name: string;
}

function EventFormForm({
  eventId,
  attributes,
}: {
  eventId: string;
  attributes: EventAttribute[];
}) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex h-64 w-64 items-center justify-center gap-2 rounded-md border border-dotted border-muted p-4 text-muted-foreground">
          <SquarePlus className="h-6 w-6" /> Stwórz formularz
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
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
                setCurrentStep(2);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { EventFormForm };
