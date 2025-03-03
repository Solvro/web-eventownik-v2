"use server";

import { formatISO9075 } from "date-fns";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";

import type { Event } from "./state";

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

  formData.append("lat", event.lat.toString());
  formData.append("long", event.long.toString());
  formData.append("primaryColor", event.color);
  formData.append("participantsCount", event.participantsNumber.toString());

  if (event.image !== "") {
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
    await Promise.all(
      event.attributes.map(async (attribute) =>
        fetch(`${API_URL}/events/${data.id}/attributes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({
            name: attribute.name,
            type: attribute.type,
          }),
        }),
      ),
    );
  }

  return data;
}
