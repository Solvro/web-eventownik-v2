"use server";

import { API_URL } from "@/lib/api";
import { isValidUuid } from "@/lib/is-valid-uuid";

export async function activateEvent(
  wasActive: boolean,
  eventUuid: string,
  bearerToken: string,
) {
  const formData = new FormData();
  formData.append("isVerified", (!wasActive).toString());

  if (!isValidUuid(eventUuid)) {
    console.error(`[activateEvent action] Invalid event UUID: ${eventUuid}`);
    return {
      error: "Invalid event identifier",
    };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}`,
    {
      method: "PATCH",
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
