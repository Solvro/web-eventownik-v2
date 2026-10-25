"use server";

import { headers } from "next/headers";

import type { EventDetailsKey } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import { isValidUuid } from "@/lib/is-valid-uuid";

interface ErrorResponse {
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
  isEmailTaken?: boolean;
  error?: SubmitFormError;
}

interface UploadFileResponse {
  fileToken: string;
  expiresAt: string;
}

async function uploadFormFile(
  eventUuid: string,
  formUuid: string,
  file: File,
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  // The backend throttles uploads per client IP, so pass the participant's IP instead of the server's
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  const response = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventUuid)}/forms/${encodeURIComponent(formUuid)}/files`,
    {
      method: "POST",
      body: formData,
      ...(forwardedFor != null && {
        headers: { "X-Forwarded-For": forwardedFor },
      }),
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
        value: result.fileToken,
      };
    });

    const fileAttributes = await Promise.all(fileUploadPromises);

    const {
      email,
      "cf-turnstile-response": turnstileToken,
      ...attributeValues
    } = values;
    const regularAttributes = Object.entries(attributeValues).map(
      ([attributeUuid, value]) => ({
        attributeUuid,
        value: value === "null" ? null : (value ?? null),
      }),
    );

    const attributes = [...regularAttributes, ...fileAttributes];

    const payload = {
      email,
      "cf-turnstile-response": turnstileToken,
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

      const errorMessages = [errorData.message ?? []]
        .flat()
        .filter(Boolean)
        .join("\n");

      return {
        success: false,
        // The backend responds with 409 only when the email is already registered for the event
        isEmailTaken: response.status === 409,
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
