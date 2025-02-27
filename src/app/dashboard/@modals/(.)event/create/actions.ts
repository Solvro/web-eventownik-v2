"use server";

import { formatISO, formatISO9075 } from "date-fns";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";

import type { Event } from "./state";

export async function saveEvent(event: Event) {
  const { bearerToken } = await verifySession();
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
  formData.append("photo", event.image);
  const data = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
    body: formData,
  }).then(async (response) => {
    return response.status === 201
      ? (response.json() as Promise<{
          id: string;
        }>)
      : (response.json() as Promise<{
          errors: { message: string }[];
        }>);
  });
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
