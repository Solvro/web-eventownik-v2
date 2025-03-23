"use server";

import { formatISO9075 } from "date-fns";
import { revalidatePath } from "next/cache";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { CoOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";

interface ErrorResponse {
  errors: { message: string }[];
}

export async function updateEvent(
  unmodifiedEvent: Event,
  event: Event,
  coOrganizersChanges: {
    added: CoOrganizer[];
    updated: CoOrganizer[];
    deleted: CoOrganizer[];
  },
): Promise<Event | ErrorResponse> {
  const session = await verifySession();
  if (session?.bearerToken == null) {
    throw new Error("Invalid session");
  }
  const { bearerToken } = session;

  // Prepare form data with proper typing
  const formData = new FormData();

  // Basic fields
  formData.append("name", event.name);
  formData.append(
    "startDate",
    formatISO9075(event.startDate, { representation: "complete" }),
  );
  formData.append(
    "endDate",
    formatISO9075(event.endDate, { representation: "complete" }),
  );
  formData.append("description", event.description ?? "");
  formData.append("organizer", event.organizer ?? "");
  if (event.slug !== unmodifiedEvent.slug) {
    formData.append("slug", event.slug);
  }
  formData.append("location", event.location ?? "");
  formData.append("primaryColor", event.primaryColor);
  formData.append(
    "participantsCount",
    (event.participantsCount ?? 0).toString(),
  );
  for (const link of event.socialMediaLinks ?? []) {
    if (link.trim() === "") {
      continue; // Skip empty links
    }
    formData.append("socialMediaLinks[]", link);
  }
  if (event.socialMediaLinks === null || event.socialMediaLinks.length === 0) {
    formData.append("socialMediaLinks", "");
  }

  // Handle photo upload
  if (event.photoUrl != null && event.photoUrl !== unmodifiedEvent.photoUrl) {
    try {
      const photoResponse = await fetch(event.photoUrl);
      if (!photoResponse.ok) {
        throw new Error(
          `Photo fetch failed with status: ${photoResponse.status.toString()}`,
        );
      }

      const blob = await photoResponse.blob();
      const filename =
        event.photoUrl.split("/").pop() ??
        `event-${Date.now().toString()}.${blob.type.split("/")[1] || "jpg"}`;
      const photoFile = new File([blob], filename, { type: blob.type });
      formData.append("photo", photoFile);
    } catch (error) {
      console.error("[updateEvent] Error processing photo:", error);
      return { errors: [{ message: "Failed to process event photo" }] };
    }
  }

  try {
    // Execute API request with proper error handling
    const response = await fetch(`${API_URL}/events/${event.id.toString()}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${bearerToken}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      console.error("[updateEvent] API Error:", {
        status: response.status,
        error: errorData,
      });
      return { errors: errorData.errors };
    }

    // Update co-organizers
    const coOrganizersErrors: { message: string }[] = [];

    try {
      for (const coOrganizer of coOrganizersChanges.added) {
        const coOrganizerResponse = await fetch(
          `${API_URL}/events/${event.id.toString()}/organizers`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: coOrganizer.email,
              permissionsIds: coOrganizer.permissions.map((perm) => perm.id),
            }),
          },
        );
        if (coOrganizerResponse.ok) {
          // For now backend doesn't return the new co-organizer ID so we can't update it here yet
          // if (coOrganizer.id == null) {
          //   const newCoOrganizer =
          //     (await coOrganizerResponse.json()) as CoOrganizer;
          //   const existingCoOrganizer = coOrganizersChanges.added.find(
          //     (co) => co.email === coOrganizer.email && co.id == null,
          //   );
          //   if (existingCoOrganizer != null) {
          //     existingCoOrganizer.id = newCoOrganizer.id;
          //   }
          // }
        } else {
          console.error(
            "[updateEvent] Error adding co-organizer:",
            coOrganizer,
          );
          coOrganizersErrors.push({
            message: `Upewnij się że ta osoba ma konto w Eventowniku.
            
            Failed to add co-organizer ${coOrganizer.email}, error: ${coOrganizerResponse.statusText}`,
          });
        }
      }

      for (const coOrganizer of coOrganizersChanges.updated) {
        if (coOrganizer.id === null) {
          continue; // Skip co-organizers without an ID
        }
        const coOrganizerResponse = await fetch(
          `${API_URL}/events/${event.id.toString()}/organizers/${coOrganizer.id.toString()}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              permissionsIds: coOrganizer.permissions.map((perm) => perm.id),
            }),
          },
        );
        if (!coOrganizerResponse.ok) {
          console.error(
            "[updateEvent] Error updating co-organizer:",
            coOrganizer,
          );
          coOrganizersErrors.push({
            message: `Failed to update co-organizer ${coOrganizer.email}, error: ${coOrganizerResponse.statusText}`,
          });
        }
      }

      for (const coOrganizer of coOrganizersChanges.deleted) {
        if (coOrganizer.id == null) {
          continue; // Skip co-organizers without an ID
        }
        const coOrganizerResponse = await fetch(
          `${API_URL}/events/${event.id.toString()}/organizers/${coOrganizer.id.toString()}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${bearerToken}` },
          },
        );
        if (!coOrganizerResponse.ok) {
          console.error(
            "[updateEvent] Error deleting co-organizer:",
            coOrganizer,
          );
          coOrganizersErrors.push({
            message: `Failed to delete co-organizer ${coOrganizer.email}, error: ${coOrganizerResponse.statusText}`,
          });
        }
      }
    } catch (error) {
      console.error("[updateEvent] Co-organizer update error:", error);
      coOrganizersErrors.push({
        message: "Failed to update co-organizers",
      });
    }

    if (coOrganizersErrors.length > 0) {
      return { errors: coOrganizersErrors };
    }

    revalidatePath(`/dashboard/events/${event.id.toString()}/settings`);
    return (await response.json()) as Event;
  } catch (error) {
    console.error("[updateEvent] Network Error:", error);
    return { errors: [{ message: "Network error occurred" }] };
  }
}
