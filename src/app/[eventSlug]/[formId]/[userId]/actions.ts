"use server";

import { API_URL } from "@/lib/api";

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
) {
  try {
    // why this thing needs event's slug instead of the event's id?!
    const response = await fetch(
      `${API_URL}/events/${eventSlug}/forms/${formId}/submit`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          participantSlug: userId,
          ...values,
        }),
      },
    );
    if (!response.ok) {
      console.error("Error when saving form", response);
      const errorData = (await response.json()) as ErrorResponse;
      console.error("Error when saving form", errorData.errors);
      return { success: false, errors: errorData.errors };
    }
  } catch (error) {
    console.error("Error when saving form", error);
    return { success: false };
  }

  return { success: true };
}
