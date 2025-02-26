"use server";

import { redirect } from "next/navigation";

import { verifySession } from "@/lib/session";
import type { EventForm } from "@/types/forms";

export async function createEventForm(
  eventId: string,
  data: Omit<EventForm, "id" | "slug">,
) {
  const session = await verifySession();
  if (session == null) {
    redirect("/login");
  }

  const response = await fetch(
    `https://api.eventownik.solvro.pl/api/v1/events/${eventId}/forms`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.bearerToken}`,
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        attributesIds: data.attributeIds,
        endDate: data.endDate,
        isOpen: data.isOpen,
      }),
    },
  );

  if (!response.ok) {
    return { success: false, error: "Failed to create event form" };
  }

  return { success: true };
}
