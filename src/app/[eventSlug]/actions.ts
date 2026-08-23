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
    return { success: false, error: "Invalid form identifier" };
  }

  try {
    const { email, token, ...attributeValues } = values;

    const attributes = Object.entries(attributeValues).map(
      ([attributeUuid, value]) => ({
        attributeUuid,
        value: value ?? null,
      }),
    );
    const payload = {
      email,
      ...(participantSlug != null && { participantId: participantSlug }),
      attributes,
    };

    // for (const file of files) {
    //   // Filename of file is corresponding attribute id
    //   formData.append(file.name, file);
    // }

    // if (participantSlug !== undefined) {
    //   formData.append("participantSlug", participantSlug);
    // }

    // for (const [key, value] of Object.entries(values)) {
    //   if (Array.isArray(value)) {
    //     // Handle opting out
    //     if (value.length === 0) {
    //       formData.append(key, "null");
    //       continue;
    //     }

    //     for (const item of value) {
    //       formData.append(key, String(item));
    //     }
    //     continue;
    //   }

    //   formData.append(key, String(value));
    // }

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
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        ...(errorData.errors.map((error) => error.message) ?? []),
      ]
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
