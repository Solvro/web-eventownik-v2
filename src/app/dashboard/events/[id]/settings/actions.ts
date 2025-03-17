"use server";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Event } from "@/types/event";

interface ErrorResponse {
  errors: { message: string }[];
}

export async function updateEvent(
  unmodifiedEvent: Event,
  event: Event,
): Promise<{ id: string } | ErrorResponse> {
  // Verify and validate session
  const session = await verifySession();
  if (session?.bearerToken == null) {
    throw new Error("Invalid session");
  }
  const { bearerToken } = session;

  // Prepare form data with proper typing
  const formData = new FormData();

  // Basic fields
  formData.append("name", event.name);
  // formData.append("startDate", event.startDate);
  // formData.append("endDate", event.endDate);
  formData.append("description", event.description ?? "");
  formData.append("organizer", event.organizer ?? "");
  if (event.slug !== unmodifiedEvent.slug) {
    formData.append("slug", event.slug);
  }
  formData.append("location", event.location ?? "");
  formData.append("primaryColor", event.primaryColor);
  formData.append(
    "participantsCount",
    (event.participantsCount ?? "").toString(),
  );
  for (const link of event.socialMediaLinks ?? []) {
    formData.append("socialMediaLinks[]", link);
  }

  // Disabling photo upload for now

  // Handle photo upload with error handling
  // if (event.photoUrl != null && event.photoUrl !== unmodifiedEvent.photoUrl) {
  //   try {
  //     const photoResponse = await fetch(event.photoUrl);
  //     if (!photoResponse.ok) {
  //       throw new Error(
  //         `Photo fetch failed with status: ${photoResponse.status}`,
  //       );
  //     }
  //
  //     const blob = await photoResponse.blob();
  //     const filename =
  //       event.photoUrl.split("/").pop() ??
  //       `event-${Date.now()}.${blob.type.split("/")[1] || "jpg"}`;
  //     const photoFile = new File([blob], filename, { type: blob.type });
  //     formData.append("photo", photoFile);
  //   } catch (error) {
  //     console.error("[updateEvent] Error processing photo:", error);
  //     return { errors: [{ message: "Failed to process event photo" }] };
  //   }
  // }

  try {
    // Execute API request with proper error handling
    const response = await fetch(`${API_URL}/events/${event.id.toString()}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${bearerToken}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.info("[updateEvent] Request body:", formData);
      console.error("[updateEvent] API Error:", {
        status: response.status,
        error: errorData,
      });
      return { errors: errorData.errors || [{ message: "Unknown API error" }] };
    }

    return (await response.json()) as { id: string };
  } catch (error) {
    console.error("[updateEvent] Network Error:", error);
    return { errors: [{ message: "Network error occurred" }] };
  }
}
