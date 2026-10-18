"use server";

import type { EventDetailsKey } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import { attributeValue } from "@/lib/api-v3";
import { isValidUuid } from "@/lib/is-valid-uuid";
import type { FormErrorObject } from "@/types/forms";
import type { V3Form } from "@/types/v3";

interface ErrorResponse {
  errors?: FormErrorObject[];
  message?: string | string[];
}

interface SubmitFormOptions {
  values: Record<string, unknown>;
  /**
   * Legacy events have IDs, new events have slugs - this handles both
   */
  eventUuid: string;
  formUuid: string;
  files: File[];
  participantSlug?: string;
}

export interface SubmitFormError {
  message?: string;
  key?: EventDetailsKey;
  values?: Record<string, string | number | Date>;
}

interface SubmitFormResult {
  success: boolean;
  errors?: FormErrorObject[];
  error?: SubmitFormError;
}

/**
 * Uploads a file for a form and returns the token to submit as the attribute value
 */
async function uploadFormFile(eventSlug: string, formUuid: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}/forms/${encodeURIComponent(formUuid)}/files`,
    {
      method: "POST",
      body: formData,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to upload file for attribute ${file.name}`);
  }

  const { fileToken } = (await response.json()) as { fileToken: string };
  return fileToken;
}

/**
 * Server action for both register and 2nd stage participant form submissions.
 */
export async function submitParticipantForm({
  values,
  eventUuid,
  formUuid,
  files,
  participantSlug,
}: SubmitFormOptions): Promise<SubmitFormResult> {
  if (!isValidUuid(formUuid)) {
    return { success: false, error: { message: "Invalid form identifier" } };
  }

  try {
    const formResponse = await fetch(
      `${API_URL}/public/events/${encodeURIComponent(eventUuid)}/forms/${formUuid}`,
    );
    if (!formResponse.ok) {
      return { success: false, error: { message: "Could not load form" } };
    }
    const form = (await formResponse.json()) as V3Form;
    // Filename of file is corresponding attribute id
    const fileAttributes = await Promise.all(
      files.map(async (file) => ({
        attributeUuid: file.name,
        value: await uploadFormFile(eventUuid, formUuid, file),
      })),
    );

    const { email, token: captchaToken, ...attributeValues } = values;
    const attributes = Object.entries(attributeValues)
      .filter(
        ([uuid, value]) =>
          value !== undefined && !files.some((file) => file.name === uuid),
      )
      .map(([attributeUuid, value]) => ({
        attributeUuid,
        value: attributeValue(
          form.formDefinitions.find(
            (definition) => definition.attributeUuid === attributeUuid,
          )?.attribute?.type ?? "text",
          value,
        ),
      }));

    const response = await fetch(
      `${API_URL}/public/events/${encodeURIComponent(eventUuid)}/forms/${encodeURIComponent(formUuid)}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          participantId: participantSlug,
          // Read by the backend TurnstileGuard.
          "cf-turnstile-response": captchaToken,
          // Uploaded files go last so their tokens override any placeholder values
          attributes: [...attributes, ...fileAttributes],
        }),
      },
    );

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;

      console.error(
        "[submitParticipantForm] Error when submitting form",
        response,
        errorData,
      );

      const errorMessages = [
        errorData.message ?? [],
        (errorData.errors ?? []).map((error) => error.message),
      ]
        .flat()
        .filter(Boolean)
        .join("\n");

      return {
        success: false,
        errors: errorData.errors,
        error: errorMessages
          ? {
              message: errorMessages,
            }
          : {
              key: "httpError" as EventDetailsKey,
              values: {
                status: response.status,
                statusText: response.statusText,
              },
            },
      };
    }
  } catch (error) {
    console.error("[submitParticipantForm] Error when submitting form", error);
    return { success: false };
  }

  return { success: true };
}
