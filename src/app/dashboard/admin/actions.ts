"use server";

import { API_URL } from "@/lib/api";
import { isValidUuid } from "@/lib/is-valid-uuid";

export async function activateEvent(
  wasActive: boolean,
  eventUuid: string,
  bearerToken: string,
) {
  if (!isValidUuid(eventUuid)) {
    console.error(`[activateEvent action] Invalid event UUID: ${eventUuid}`);
    return {
      error: "Invalid event identifier",
    };
  }

  // v2 "activation" is v3 verification, which lists published events on the homepage
  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isVerified: !wasActive }),
    },
  );
  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(error);
    console.error(
      `[activateEvent action] Failed to activate event ${eventUuid}: ${JSON.stringify(error)}`,
    );
    return {
      error: JSON.stringify(error),
    };
  }
  return {
    success: true,
  };
}

export async function checkIfSuperAdmin(bearerToken: string) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });
  if (!response.ok) {
    return false;
  }
  const data = (await response.json()) as { type: "organizer" | "superadmin" };
  return data.type === "superadmin";
}
