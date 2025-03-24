"use server";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";

interface ErrorObject {
  rule: string;
  field: string;
}

interface ErrorResponse {
  errors: ErrorObject[];
}

export async function submitForm(
  values: any,
  formId: string,
  eventSlug: string,
  userId: string,
) {
  try {
    const session = await verifySession();
    const { bearerToken } = session;
    // why this thing needs event's slug instead of the event's id?!
    const response = await fetch(
      `${API_URL}/events/${eventSlug}/forms/${formId}/submit`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
        method: "POST",
        body: JSON.stringify({
          participantSlug: userId,
          ...values,
        }),
      },
    );
    if (!response.ok) {
      console.error(response.status);
      //console.error("Error when saving form", response);
      const errorData = (await response.json()) as ErrorResponse;
      console.log(errorData);
      //console.error("Error when saving form", errorData.errors);
      return { success: false, errors: errorData.errors };
    }
  } catch (error) {
    console.error("Error when saving form", error);
    return { success: false };
  }

  return { success: true };
}
