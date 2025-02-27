"use client";

import { useState } from "react";

import { AttributesForm } from "./(steps)/attributes";
import { GeneralInfoForm } from "./(steps)/general-info";

interface EventAttribute {
  id: number;
  name: string;
}

type FormStep = "general-info" | "attributes";

function EventFormForm({
  eventId,
  attributes,
}: {
  eventId: string;
  attributes: EventAttribute[];
}) {
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
          eventId={eventId}
          attributes={attributes}
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
