import { redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";

interface EventAttribute {
  id: number;
  name: string;
}

async function getEventFormAttributes(eventId: string) {
  const session = await verifySession();
  if (session == null) {
    redirect("/login");
  }

  const response = await fetch(`${API_URL}/events/${eventId}/attributes`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
    },
  });

  if (!response.ok) {
    console.error(
      `[getEventFormAttributes] Failed to fetch attributes for event ${eventId}:`,
      response,
    );
    // TODO: This is a placeholder. Should be removed when creating events is implemented
    return [
      { id: 1, name: "Foo" },
      { id: 2, name: "Bar" },
      { id: 3, name: "Baz" },
    ];
  }

  const attributes = (await response.json()) as EventAttribute[];
  return attributes;
}

export { getEventFormAttributes };
