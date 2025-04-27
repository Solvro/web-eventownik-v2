"use server";

import { API_URL } from "@/lib/api";
import type { PublicBlock } from "@/types/blocks";

interface ErrorObject {
  rule: string;
  field: string;
}

interface ErrorResponse {
  errors: ErrorObject[];
}

type Values = Record<string, unknown>;

export async function submitForm(
  values: Values,
  formId: string,
  eventSlug: string,
  userId: string,
  files: File[],
) {
  try {
    const formData = new FormData();

    for (const file of files) {
      //Filename of file is corresponding attribute id
      formData.append(file.name, file);
    }

    formData.append("participantSlug", userId);
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, String(value));
    }

    const response = await fetch(
      `${API_URL}/events/${eventSlug}/forms/${formId}/submit`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      console.error("Error when saving form", response);
      const errorData = (await response.json()) as ErrorResponse;
      console.error("Error when saving form", errorData);
      return { success: false, errors: errorData.errors };
    }
  } catch (error) {
    console.error("Error when saving form", error);
    return { success: false };
  }

  return { success: true };
}

export async function getEventBlockAttributeBlocks(
  eventSlug: string,
  attributeId: string,
) {
  const blocksResponse = await fetch(
    `${API_URL}/events/${eventSlug}/attributes/${attributeId}/blocks`,
    {
      method: "GET",
    },
  );
  if (!blocksResponse.ok) {
    const error = (await blocksResponse.json()) as unknown;
    console.error(error);
    throw new Error(`Failed to fetch block with id ${attributeId}`);
  }
  return (await blocksResponse.json()) as PublicBlock[];
}
