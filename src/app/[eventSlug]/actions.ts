"use server";

import type { z } from "zod";

import { API_URL } from "@/lib/api";
import type { registerParticipantFormSchema } from "@/types/schemas";

export async function registerParticipant(
  values: z.infer<typeof registerParticipantFormSchema>,
  eventId: string,
) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}/participants`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        eventId,
        firstName: values.firstName,
        lastName: values.lastName,
      }),
    });
    if (!response.ok) {
      console.error("Error when registering participant", response);
      return { success: false };
    }
  } catch (error) {
    console.error("Error when registering participant", error);
    return { success: false };
  }

  return { success: true };
}
