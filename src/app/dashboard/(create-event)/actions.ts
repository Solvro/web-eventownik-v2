"use server";

import { formatISO } from "date-fns";

import { API_URL } from "@/lib/api";
import { generateFileFromDataUrl } from "@/lib/event";
import { verifySession } from "@/lib/session";

import type { Event } from "./state";

export async function isSlugTaken(slug: string) {
  const response = await fetch(`${API_URL}/events/${slug}/public`);
  return response.ok;
}

interface SaveEventResult {
  id?: string;
  errors?: { message: string }[];
  warnings?: string[];
}

export async function saveEvent(event: Event): Promise<SaveEventResult> {
  const session = await verifySession();
  if (session == null || typeof session.bearerToken !== "string") {
    throw new Error("Invalid session");
  }
  const { bearerToken } = session;

  const warnings: string[] = [];

  const formData = new FormData();

  formData.append("name", event.name);
  formData.append("description", event.description ?? "");
  formData.append("organizer", event.organizer ?? "");
  formData.append("contactEmail", event.contactEmail ?? "");
  formData.append("slug", event.slug);
  formData.append("termsLink", event.termsLink ?? "");
  formData.append("startDate", formatISO(event.startDate));
  formData.append("endDate", formatISO(event.endDate));
  formData.append("location", event.location ?? "");
  formData.append("primaryColor", event.primaryColor);
  formData.append("participantsCount", event.participantsNumber.toString());

  for (const _link of event.socialMediaLinks) {
    if (_link.link) {
      const value =
        _link.label == null ? _link.link : `[${_link.label}](${_link.link})`;
      formData.append("socialMediaLinks[]", value);
    }
  }

  if (event.photoUrl) {
    try {
      const photoFile = generateFileFromDataUrl(event.photoUrl);
      formData.append("photo", photoFile);
    } catch (error) {
      console.error("[saveEvent] Error processing photo:", error);
      return {
        errors: [{ message: "Failed to process event photo" }],
      };
    }
  }

  const response = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = (await response.json()) as { errors: { message: string }[] };
    console.error(
      `[saveEvent] Failed to create event: ${error.errors[0]?.message ?? "Unknown error"}`,
    );
    return { errors: error.errors };
  }

  const data = (await response.json()) as Record<"id", string>;

  if (!("id" in data)) {
    console.error("[saveEvent] No event ID returned from server");
    return { errors: [{ message: "Failed to create event" }] };
  }

  const eventId = data.id;
  console.warn(`[saveEvent] Event created successfully with ID: ${eventId}`);

  const coOrganizerErrors: string[] = [];
  let coOrganizersAdded = 0;

  for (const coorganizer of event.coorganizers) {
    try {
      const coorganizerResponse = await fetch(
        `${API_URL}/events/${eventId}/organizers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: coorganizer.email,
            permissionsIds: [1],
          }),
        },
      );

      if (coorganizerResponse.ok) {
        coOrganizersAdded++;
      } else {
        const errorData = (await coorganizerResponse.json()) as {
          errors: { message: string }[];
        };
        console.error(
          `[saveEvent] Failed to add co-organizer ${coorganizer.email}:`,
          errorData,
        );
        coOrganizerErrors.push(
          `Failed to add co-organizer ${coorganizer.email}. You can add them later in settings.`,
        );
      }
    } catch (error) {
      console.error(
        `[saveEvent] Error adding co-organizer ${coorganizer.email}:`,
        error,
      );
      coOrganizerErrors.push(
        `Error adding co-organizer ${coorganizer.email}. You can add them later in settings.`,
      );
    }
  }

  if (coOrganizerErrors.length > 0) {
    console.warn(
      `[saveEvent] Added ${coOrganizersAdded.toString()}/${event.coorganizers.length.toString()} co-organizers`,
    );
    warnings.push(...coOrganizerErrors);
  }

  const attributeErrors: string[] = [];
  let attributesAdded = 0;

  for (const attribute of event.attributes) {
    try {
      const attributeResponse = await fetch(
        `${API_URL}/events/${eventId}/attributes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: attribute.name,
            type: attribute.type,
            slug: attribute.slug,
            showInList: attribute.showInList,
            options:
              (attribute.options ?? []).length > 0
                ? attribute.options
                : undefined,
            order: attribute.order,
            isSensitiveData: false,
            reason: null,
          }),
        },
      );

      if (attributeResponse.ok) {
        attributesAdded++;
      } else {
        const errorData = (await attributeResponse.json()) as {
          errors: { message: string }[];
        };
        console.error(
          `[saveEvent] Failed to add attribute ${attribute.name}:`,
          errorData,
        );
        attributeErrors.push(
          `Failed to add attribute ${attribute.name}. You can add it later in settings.`,
        );
      }
    } catch (error) {
      console.error(
        `[saveEvent] Error adding attribute ${attribute.name}:`,
        error,
      );
      attributeErrors.push(
        `Error adding attribute ${attribute.name}. You can add it later in settings.`,
      );
    }
  }

  if (attributeErrors.length > 0) {
    console.warn(
      `[saveEvent] Added ${attributesAdded.toString()}/${event.attributes.length.toString()} attributes`,
    );
    warnings.push(...attributeErrors);
  }

  // Log final summary
  if (warnings.length > 0) {
    console.warn(
      `[saveEvent] Event ${eventId} created with ${warnings.length.toString()} warnings`,
    );
  } else {
    console.warn(`[saveEvent] Event ${eventId} created successfully`);
  }

  return {
    id: eventId,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
