"use server";

import { redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Block } from "@/types/blocks";

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
  const block = (await response.json()) as Block;

  if (response.ok) {
    redirect(`/dashboard/events/${eventId}/blocks/${attributeId}`);
  } else {
    console.error(block);
    redirect(`/dashboard/events/${eventId}`);
  }
}
