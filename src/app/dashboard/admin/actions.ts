"use server";

import { API_URL } from "@/lib/api";

async function activateEvent(
  wasActive: boolean,
  eventId: number,
  bearerToken: string,
) {
  const formData = new FormData();
  formData.append("isActive", (!wasActive).toString());

  const response = await fetch(
    `${API_URL}/events/${eventId.toString()}/activate`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      body: formData,
    },
  );
  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(error);
    console.error(
      `[activateEvent action] Failed to activate event ${eventId.toString()}: ${JSON.stringify(error)}`,
    );
    return {
      error: JSON.stringify(error),
    };
  }
  return {
    success: "Wydarzenie zostało pomyślnie aktywowane",
  };
}

export { activateEvent };
