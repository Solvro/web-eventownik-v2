"use server";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Participant } from "@/types/participant";

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
  eventId: string,
  eventSlug: string,
  userId: string,
) {
  try {
    // form submission requires user's email even though I have their id here
    const participantResponse = await fetch(
      `${API_URL}/events/${eventId}/participants/${userId}`,
    );
    if (!participantResponse.ok) {
      console.error(
        "Error during getting participant's email",
        participantResponse,
      );
      const errorData = (await participantResponse.json()) as ErrorResponse;
      console.error(
        "Error during getting participant's email",
        errorData.errors,
      );
      return { success: false, errors: errorData.errors };
    }
    const participant = (await participantResponse.json()) as Participant;
    // why this thing needs event's slug instead of the event's id?!
    const response = await fetch(
      `${API_URL}/events/${eventSlug}/forms/${formId}/submit`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          email: participant.email,
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
