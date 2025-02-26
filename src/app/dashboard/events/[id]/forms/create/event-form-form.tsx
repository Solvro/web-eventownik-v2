"use client";

import { useState } from "react";

import { AttributesForm } from "./(steps)/attributes";
import { GeneralInfoForm } from "./(steps)/general-info";

/* 
  Root komponent dla formularza tworzenia formularza wydarzenia
  Renderuje odpowiedni krok w zależności od URL paramsów
  Jest wykorzystywany zarówno w parallel roucie gdzie jest wsadzany do modalu
  oraz w dynamic routingu gdzie jest renderowany wewnątrz regularnej strony
*/

type FormStep = "general-info" | "attributes";

function EventFormForm() {
  const [formStep, setFormStep] = useState<FormStep>("general-info");

  switch (formStep) {
    case "general-info": {
      return (
        <GeneralInfoForm
          goToNextStep={() => {
            setFormStep("attributes");
          }}
        />
      );
    }
    case "attributes": {
      return (
        <AttributesForm
          goToPreviousStep={() => {
            setFormStep("general-info");
          }}
        />
      );
    }
    default: {
      return <p>Ładowanie...</p>;
    }
  }
}

export { EventFormForm };
