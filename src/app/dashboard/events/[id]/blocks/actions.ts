"use server";

import { redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";

export const fetchBlock = async (eventId: string, blockId: string) => {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;

  const response = await fetch(
    `${API_URL}/events/${eventId}/attributes/${blockId}`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  const attribute = (await response.json()) as Attribute;
  if (!response.ok) {
    console.error(attribute);
    return null;
  }
  return attribute;
  // return attributes.filter(
  //   (attribute: { type: string }) => attribute.type === "block",
  // );
};
