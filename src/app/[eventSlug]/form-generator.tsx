"use client";

import { useEffect, useRef, useState } from "react";

import { getEventBlockAttributeBlocks } from "@/app/[eventSlug]/utils";
import { ParticipantForm } from "@/components/participant-form";
import type { Block } from "@/types/blocks";
import type { FormDefinition } from "@/types/forms";
import type { Participant } from "@/types/participant";

import { submitParticipantForm } from "./actions";

export function FormGenerator({
  formDefinitions,
  userData,
  originalEventBlocks,
  formUuid,
  eventSlug,
  userSlug,
  editMode,
}: {
  formDefinitions: FormDefinition[];
  userData?: Participant;
  originalEventBlocks: Block[];
  formUuid: string;
  eventSlug: string;
  userSlug?: string;
  editMode: boolean;
}) {
  const [eventBlocks, setEventBlocks] = useState(originalEventBlocks);
  const currentBlocksRef = useRef<Block[]>(originalEventBlocks);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    async function updateBlocksData() {
      const blockAttributes = formDefinitions
        .map((definition) => definition.attribute)
        .filter((attribute) => attribute.type === "block");
      if (blockAttributes.length === 0) {
        return;
      }

      try {
        const blocks = await Promise.all(
          blockAttributes.map(async (attribute) =>
            getEventBlockAttributeBlocks(eventSlug, attribute.uuid),
          ),
        );

        const updatedBlocks = blocks.filter((block) => block != null);

        if (
          isMounted.current &&
          JSON.stringify(currentBlocksRef.current) !== JSON.stringify(blocks)
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
  }, [eventSlug, formDefinitions]);

  return (
    <ParticipantForm
      formDefinitions={formDefinitions}
      onSubmit={async (values, files) =>
        submitParticipantForm({
          values,
          formUuid,
          eventUuid: eventSlug,
          participantSlug: userSlug,
          files,
        })
      }
      userData={userData}
      eventBlocks={eventBlocks}
      editMode={editMode}
      includeEmail={!editMode}
    />
  );
}
