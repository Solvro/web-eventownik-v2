"use server";

import { formatISO9075 } from "date-fns";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";

import type { Event } from "./state";

export async function isSlugTaken(slug: string) {
  const response = await fetch(`${API_URL}/events/${slug}/public`);
  return response.ok;
}

export async function saveEvent(event: Event) {
  const session = await verifySession();
  if (session == null || typeof session.bearerToken !== "string") {
    throw new Error("Invalid session");
  }
  const { bearerToken } = session;

  const formData = new FormData();

  formData.append("name", event.name);
  formData.append("description", event.description ?? "");
  formData.append("organizer", event.organizer ?? "");
  formData.append("slug", event.slug);

  formData.append(
    "startDate",
    formatISO9075(event.startDate, { representation: "complete" }),
  );
  formData.append(
    "endDate",
    formatISO9075(event.endDate, { representation: "complete" }),
  );

  formData.append("location", event.location ?? "");
  formData.append("primaryColor", event.color);
  formData.append("participantsCount", event.participantsNumber.toString());

  for (const _link of event.socialMediaLinks) {
    if (_link.link) {
      const value =
        _link.label == null ? _link.link : `[${_link.label}](${_link.link})`;
      formData.append("socialMediaLinks[]", value);
    }
  }

  if (event.image) {
    const photo = await fetch(event.image)
      .then(async (response) => response.blob())
      .then((blob) => {
        return new File([blob], "File name", { type: "image/jpeg" });
      });
    formData.append("photo", photo);
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
      `[saveEvent action] Failed to create a new event: ${error.errors[0].message}`,
    );
    return { errors: error.errors };
  }

  const data = (await response.json()) as Record<"id", string>;

  if ("id" in data) {
    try {
      for (const coorganizer of event.coorganizers) {
        const coorganizerResponse = await fetch(
          `${API_URL}/events/${data.id}/organizers`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: coorganizer.email,
              permissionsIds: [1], //coOrganizer.permissions.map((perm) => perm.id), // Temporary only one permission
            }),
          },
        );
        if (!coorganizerResponse.ok) {
          console.error(
            "[saveEvent action] Error when adding coorganizer:",
            coorganizer,
          );
          return {
            errors: [],
          };
        }
      }
    } catch (error) {
      console.error("[saveEvent] Error when adding coorganizers:", error);
      return {
        errors: [],
      };
    }

    try {
      for (const attribute of event.attributes) {
        const attributeResponse = await fetch(
          `${API_URL}/events/${data.id}/attributes`,
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
            }),
          },
        );
        if (!attributeResponse.ok) {
          console.error("[saveEvent] Error when adding attribute:", attribute);
          return {
            errors: [],
          };
        }
      }
    } catch (error) {
      console.error("[saveEvent] Error when adding attributes:", error);
      return {
        errors: [],
      };
    }
  }
  return data;
}
