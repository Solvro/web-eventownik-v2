"use client";

import React, { useEffect, useRef, useState } from "react";

import { getEventBlockAttributeBlocks } from "@/app/[eventSlug]/utils";
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
  const [eventBlocks, setEventBlocks] = useState(originalEventBlocks);
  const currentBlocksRef = useRef<PublicBlock[]>(originalEventBlocks); // used to prevent unnecessary re-renders
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    async function updateBlocksData() {
      const blockAttributes = attributes.filter(
        (attribute) => attribute.type === "block",
      );
      if (blockAttributes.length === 0) {
        return;
      }

      try {
        const updatedBlocks = (await Promise.all(
          blockAttributes.map(async (attribute) =>
            getEventBlockAttributeBlocks(eventSlug, attribute.id.toString()),
          ),
        )) as unknown as PublicBlock[];

        if (
          isMounted.current &&
          JSON.stringify(currentBlocksRef.current) !==
            JSON.stringify(updatedBlocks)
        ) {
          currentBlocksRef.current = updatedBlocks;
          setEventBlocks(updatedBlocks);
        }
      } finally {
        if (isMounted.current) {
          setTimeout(updateBlocksData, 1000);
        }
      }
    }

    void updateBlocksData();

    return () => {
      isMounted.current = false;
    };
  }, [eventSlug, attributes]);

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
