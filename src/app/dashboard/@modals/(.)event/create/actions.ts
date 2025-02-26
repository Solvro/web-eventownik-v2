"use server";

import { API_URL } from "@/lib/api";

import type { Event } from "./state";

export async function saveEvent(event: Event) {
  const data = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: event.name,
      description: event.description,
      organizer: event.organizer,
      slug: event.slug,
      startDate: event.startDate,
      endDate: event.endDate,
      lat: event.lat,
      long: event.long,
      primaryColor: event.color,
      participantsCount: event.participantsNumber,
      photo: event.image,
    }),
  }).then(async (response) => {
    if (response.status !== 201) {
      return response.json() as Promise<{ errors: { message: string }[] }>;
    }
  });
  return data;
}
