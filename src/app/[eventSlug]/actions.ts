"use server";

import type { z } from "zod";

import { API_URL } from "@/lib/api";
import type { Event } from "@/types/event";
import type { registerParticipantFormSchema } from "@/types/schemas";

export async function registerParticipant(
  values: z.infer<typeof registerParticipantFormSchema>,
  event: Event,
) {
  try {
    const response = await fetch(
      `${API_URL}/events/${event.slug}/forms/${event.firstForm.id.toString()}/submit`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          participantSlug: crypto.randomUUID(),
          attributes: values,
        }),
      },
    );
    if (!response.ok) {
      console.error("Error when registering participant", response);
      console.error(
        "Error when registering participant",
        await response.json(),
      );
      return { success: false };
    }
  } catch (error) {
    console.error("Error when registering participant", error);
    return { success: false };
  }

  return { success: true };
}

//
// export async function getRegisterForm(eventId: string, formId: string) {
//   try {
//     const response = await fetch(`${API_URL}/events/${eventId}/participants`, {
//       headers: {
//         Authorization: `Bearer ${formId}`,
//       },
//       method: "GET",
//     });
//     if (!response.ok) {
//       console.error("Error when registering participant", response);
//       return null;
//     }
//     const form = await response.json();
//     return form;
//   } catch (error) {
//     console.error("Error when registering participant", error);
//     return null;
//   }
// }
