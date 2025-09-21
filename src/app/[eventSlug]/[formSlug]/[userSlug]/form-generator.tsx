"use client";

import React from "react";

import { ParticipantForm } from "@/components/participant-form";
import type { FormAttribute } from "@/types/attributes";
import type { PublicBlock } from "@/types/blocks";
import type { PublicParticipant } from "@/types/participant";

import { submitForm } from "./actions";

export function FormGenerator({
  attributes,
  userData,
  originalEventBlocks,
  formId,
  eventSlug,
  userSlug,
}: {
  attributes: FormAttribute[];
  userData: PublicParticipant;
  originalEventBlocks: PublicBlock[];
  formId: string;
  eventSlug: string;
  userSlug: string;
}) {
  const eventBlocks = originalEventBlocks;

  return (
    <ParticipantForm
      attributes={attributes}
      onSubmit={async (values, files) =>
        submitForm(values, formId, eventSlug, userSlug, files)
      }
      successMessage="Twoja odpowiedź została zapisana!"
      submitButtonText="Zapisz"
      submittingText="Zapisywanie..."
      userData={userData}
      eventBlocks={eventBlocks}
      editMode={true}
    />
  );
}
