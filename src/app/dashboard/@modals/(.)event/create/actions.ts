"use server";

import { formatISO } from "date-fns";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";

import type { Event } from "./state";

export async function saveEvent(event: Event) {
  const { bearerToken } = await verifySession();
  const data = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      name: event.name,
      description: event.description,
      organizer: event.organizer,
      slug: event.slug,
      startDate: formatISO(event.startDate, { representation: "complete" }),
      endDate: formatISO(event.endDate, { representation: "complete" }),
      lat: event.lat,
      long: event.long,
      primaryColor: event.color,
      participantsCount: event.participantsNumber,
      photo: event.image,
    }),
  }).then(async (response) => {
    if (response.status !== 201) {
      return response.json() as Promise<{
        errors: { message: string }[];
      }>;
    }
  });
  return data;
}
