"use server";

import type { z } from "zod";

import { API_URL } from "@/lib/api";
import type { Event } from "@/types/event";
import type { registerParticipantFormSchema } from "@/types/schemas";

interface ErrorObject {
  rule: string;
  field: string;
  message: string;
}

interface ErrorResponse {
  errors: ErrorObject[];
  message: string | undefined;
}

export async function registerParticipant(
  values: z.infer<typeof registerParticipantFormSchema>,
  event: Event,
  files: File[],
) {
  if (event.firstForm === null) {
    return { success: false };
  }

  try {
    const formData = new FormData();

    for (const f of files) {
      //Filename of file is corresponding attribute id
      formData.append(f.name, f);
    }

    for (const [key, value] of Object.entries(values)) {
      formData.append(key, String(value as unknown));
    }

    const response = await fetch(
      `${API_URL}/events/${event.slug}/forms/${event.firstForm.id.toString()}/submit`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      console.error("Error when registering participant", response);
      const errorData = (await response.json()) as ErrorResponse;
      console.error("Error when registering participant", errorData);
      return { success: false, errors: errorData.errors };
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
