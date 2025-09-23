import "@measured/puck/no-external.css";
import { notFound, redirect } from "next/navigation";

import { EmailEditor } from "@/components/editor/index";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { EventAttribute } from "@/types/attributes";
import type { Event } from "@/types/event";
import type { Participant } from "@/types/participant";

async function getEventData(bearerToken: string, id: string) {
  const response = await fetch(`${API_URL}/events/${id}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    notFound();
  }

  const event = (await response.json()) as Event;
  return event;
}

async function getParticipantData(bearerToken: string, id: string) {
  const response = await fetch(`${API_URL}/events/${id}/participants`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    notFound();
  }

  const participants = (await response.json()) as Participant[];
  return participants;
}

async function getAttributesData(bearerToken: string, id: string) {
  const response = await fetch(`${API_URL}/events/${id}/attributes`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    notFound();
  }

  const attributes = (await response.json()) as EventAttribute[];
  return attributes;
}

// Render Puck editor
export default async function EmailEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;
  const { id } = await params;

  const event = await getEventData(bearerToken, id);
  const participants = await getParticipantData(bearerToken, id);
  const attributes = await getAttributesData(bearerToken, id);

  return <EmailEditor eventData={{ event, participants, attributes }} />;
}
