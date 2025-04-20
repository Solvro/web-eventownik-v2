"use server";

import { redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";

export async function createBlock(
  eventId: string,
  attributeId: string,
  parentId: string,
  name: string,
  description: string | null,
  capacity: number | null,
) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;

  const response = await fetch(
    `${API_URL}/events/${eventId}/attributes/${attributeId}/blocks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parentId,
        name,
        description: description ?? null,
        capacity: capacity ?? null,
      }),
    },
  );

  if (response.ok) {
    return {
      success: true,
    };
  } else {
    const error = (await response.json()) as unknown;
    console.error(
      `[createBlock action] Failed to create a block for event ${eventId}:`,
      error,
    );
    return {
      success: false,
      error: `Błąd ${response.status.toString()} ${response.statusText}`,
    };
  }
}

export async function updateBlock(
  eventId: string,
  attributeId: string,
  blockId: string,
  name: string,
  description: string | null,
  capacity: number | null,
) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;

  const response = await fetch(
    `${API_URL}/events/${eventId}/attributes/${attributeId}/blocks/${blockId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description: description ?? null,
        capacity: capacity ?? null,
      }),
    },
  );

  if (response.ok) {
    return {
      success: true,
    };
  } else {
    const error = (await response.json()) as unknown;
    console.error(
      `[updateBlock action] Failed to update block ${blockId} for event ${eventId}:`,
      error,
    );
    return {
      success: false,
      error: `Błąd ${response.status.toString()} ${response.statusText}`,
    };
  }
}

export async function deleteBlock(
  eventId: string,
  blockId: string,
  attributeId: string,
) {
  const session = await verifySession();

  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${eventId}/attributes/${attributeId}/blocks/${blockId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[deleteBlock action] Failed to delete block ${blockId} for event ${eventId}:`,
      error,
    );
    return {
      success: false,
      error: `Błąd ${response.status.toString()} ${response.statusText}`,
    };
  }

  return { success: true };
}
