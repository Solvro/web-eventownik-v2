"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getEventBlockAttributeBlocks } from "@/app/[eventSlug]/utils";
import { ParticipantForm } from "@/components/participant-form";
import { formControls, participantFormValues } from "@/lib/form-controls";
import type { PublicBlock } from "@/types/blocks";
import type { V3Form, V3PublicParticipant } from "@/types/v3";

import { submitParticipantForm } from "./actions";

export function FormGenerator({
  form,
  userData,
  originalEventBlocks,
  formUuid,
  eventSlug,
  userSlug,
  editMode,
}: {
  form: V3Form;
  userData?: V3PublicParticipant;
  originalEventBlocks: PublicBlock[];
  formUuid: string;
  eventSlug: string;
  userSlug?: string;
  editMode: boolean;
}) {
  const attributes = useMemo(() => formControls(form), [form]);
  const initialValues = participantFormValues(attributes, userData);
  const lastUpdated = Object.fromEntries(
    (userData?.attributes ?? [])
      .filter((entry) => entry.value !== null && entry.value !== "")
      .map((entry) => [entry.attributeUuid, entry.updatedAt]),
  );
  const selectedBlockUuids = (userData?.attributes ?? [])
    .filter((entry) => entry.attribute.type === "block")
    .flatMap((entry) =>
      Array.isArray(entry.value)
        ? entry.value.filter(
            (value): value is string => typeof value === "string",
          )
        : typeof entry.value === "string"
          ? [entry.value]
          : [],
    );
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
        const updatedBlocks = await Promise.all(
          blockAttributes.map(async (attribute) =>
            getEventBlockAttributeBlocks(eventSlug, attribute.uuid),
          ),
        );

        if (
          isMounted.current &&
          !updatedBlocks.includes(null) &&
          JSON.stringify(currentBlocksRef.current) !==
            JSON.stringify(updatedBlocks)
        ) {
          currentBlocksRef.current = updatedBlocks.filter(
            (block) => block !== null,
          );
          setEventBlocks(updatedBlocks.filter((block) => block !== null));
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
        submitParticipantForm({
          values,
          formUuid,
          eventUuid: eventSlug,
          participantSlug: userSlug,
          files,
        })
      }
      initialValues={initialValues}
      lastUpdated={lastUpdated}
      selectedBlockUuids={selectedBlockUuids}
      eventBlocks={eventBlocks}
      eventSlug={eventSlug}
      editMode={editMode}
      includeEmail={!editMode}
    />
  );
}
