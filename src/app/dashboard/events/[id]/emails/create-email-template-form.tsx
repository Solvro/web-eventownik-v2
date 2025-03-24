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

import { MessageContentForm } from "./(steps)/message-content";
import { TriggerTypeForm } from "./(steps)/trigger-type";

function CreateEmailTemplateForm({ eventId }: { eventId: string }) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex h-64 w-64 items-center justify-center gap-2 rounded-md border border-dotted border-muted p-4 text-muted-foreground">
          <SquarePlus className="h-6 w-6" /> Stwórz szablon
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="sr-only">
          <DialogTitle>Stwórz szablon</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {currentStep === 0 && (
            <TriggerTypeForm
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
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CreateEmailTemplateForm };
