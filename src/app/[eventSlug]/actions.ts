"use server";

import { API_URL } from "@/lib/api";
import type { FormErrorObject } from "@/types/form";

interface ErrorResponse {
  errors: FormErrorObject[];
  message: string | undefined;
}

interface SubmitFormOptions {
  values: Record<string, unknown>;
  /**
   * Legacy events have IDs, new events have slugs - this handles both
   */
  eventId: string;
  formId: string;
  files: File[];
  participantSlug?: string;
}

interface SubmitFormResult {
  success: boolean;
  errors?: FormErrorObject[];
  error?: string;
}

/**
 * Server action for both register and 2nd stage participant form submissions.
 */
export async function submitParticipantForm({
  values,
  eventId,
  formId,
  files,
  participantSlug,
}: SubmitFormOptions): Promise<SubmitFormResult> {
  try {
    const formData = new FormData();

    for (const file of files) {
      // Filename of file is corresponding attribute id
      formData.append(file.name, file);
    }

    if (participantSlug !== undefined) {
      formData.append("participantSlug", participantSlug);
    }

    for (const [key, value] of Object.entries(values)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          formData.append(`${key}[]`, String(item));
        }
        continue;
      }

      formData.append(key, String(value));
    }

    const response = await fetch(
      `${API_URL}/events/${eventId}/forms/${formId}/submit`,
      {
        method: "POST",
        body: formData,
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
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        ...(errorData.errors.map((error) => error.message) ?? []),
      ]
        .filter(Boolean)
        .join("\n");

      return {
        success: false,
        errors: errorData.errors,
        error:
          errorMessages ||
          `Błąd ${response.status.toString()} ${response.statusText}`,
      };
    }
  } catch (error) {
    console.error("[submitParticipantForm] Error when submitting form", error);
    return { success: false };
  }

  return { success: true };
}
