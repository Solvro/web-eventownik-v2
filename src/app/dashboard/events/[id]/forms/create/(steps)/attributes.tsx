"use client";

import { Button } from "@/components/ui/button";

function EventFormAttributesStep({
  goToPreviousStep,
}: {
  goToPreviousStep: () => void;
}) {
  return (
    <Button
      onClick={() => {
        goToPreviousStep();
      }}
    >
      Poprzedni krok
    </Button>
  );
}

export { EventFormAttributesStep };
