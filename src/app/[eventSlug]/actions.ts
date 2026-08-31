"use server";

import type { EventDetailsKey } from "@/i18n/translate-or-fallback";
import { API_URL } from "@/lib/api";
import { isValidUuid } from "@/lib/is-valid-uuid";
import type { FormErrorObject } from "@/types/forms";

interface ErrorResponse {
  errors: FormErrorObject[];
  message: string | undefined;
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

interface UploadFileResponse {
  fileId: string;
}

async function uploadFormFile(
  eventUuid: string,
  formUuid: string,
  file: File,
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventUuid)}/forms/${encodeURIComponent(formUuid)}/files`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${file.name}`);
  }

  return (await response.json()) as UploadFileResponse;
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
    const fileUploadPromises = files.map(async (file) => {
      const result = await uploadFormFile(eventUuid, formUuid, file);
      return {
        attributeUuid: file.name,
        value: result.fileId,
      };
    });

    const fileAttributes = await Promise.all(fileUploadPromises);

    const { email, token, ...attributeValues } = values;
    const textAttributes = Object.entries(attributeValues).map(
      ([attributeUuid, value]) => ({
        attributeUuid,
        value: value ?? null,
      }),
    );

    const attributes = [...textAttributes, ...fileAttributes];

    const payload = {
      email,
      ...(participantSlug != null && { participantId: participantSlug }),
      attributes,
    };

    const response = await fetch(
      `${API_URL}/public/events/${encodeURIComponent(eventUuid)}/forms/${encodeURIComponent(formUuid)}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
        errorData.message,
        ...errorData.errors.map((error) => error.message),
      ]
        .filter(Boolean)
        .join("\n");

      return {
        success: false,
        errors: errorData.errors,
        error: errorMessages
          ? { message: errorMessages }
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
