"use client";

import { Button } from "@/components/ui/button";

function AttributesForm({
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

export { AttributesForm };
