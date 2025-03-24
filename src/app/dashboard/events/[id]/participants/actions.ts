"use server";

import { redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type { EventEmail } from "@/types/emails";
import type { Participant } from "@/types/participant";

export async function getParticipants(eventId: string, bearerToken: string) {
  const response = await fetch(`${API_URL}/events/${eventId}/participants`, {
    method: "GET",
    headers: { Authorization: `Bearer ${bearerToken}` },
  });
  if (!response.ok) {
    console.error("Failed to fetch participants", response);
    return null;
  }
  const participants = (await response.json()) as Participant[];
  return participants;
}

export async function getAttributes(eventId: string, bearerToken: string) {
  const response = await fetch(`${API_URL}/events/${eventId}/attributes`, {
    method: "GET",
    headers: { Authorization: `Bearer ${bearerToken}` },
  });
  if (!response.ok) {
    console.error("Failed to fetch attributes", response);
    return null;
  }
  const attributes = (await response.json()) as Attribute[];
  return attributes;
}

export async function deleteParticipant(
  eventId: string,
  participantId: string,
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${eventId}/participants/${participantId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.bearerToken}` },
    },
  );

  if (!response.ok) {
    console.error("Failed to delete user", response);
    if (response.status === 500) {
      return {
        success: false,
        error: "Serwer nie działa poprawnie. Spróbuj ponownie później",
      };
    }
    return { success: false };
  }
  return { success: true };
}

export async function updateParticipant(
  values: Record<number, string>,
  eventId: string,
  participantId: string,
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${eventId}/participants/${participantId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participantAttributes: Object.entries(values)
          .filter(([, value]) => value !== "")
          .map(([key, value]) => ({ attributeId: key, value })),
      }),
    },
  );

  if (!response.ok) {
    console.error("Failed to update user", response);
    if (response.status === 500) {
      return {
        success: false,
        error: "Serwer nie działa poprawnie. Spróbuj ponownie później",
      };
    }
    return { success: false };
  }
  return { success: true };
}

export async function getEmails(eventId: string) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  const response = await fetch(`${API_URL}/events/${eventId}/emails`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch mails", response);
    return null;
  }
  const mails = (await response.json()) as EventEmail[];
  return mails;
}

export async function sendMail(
  eventId: string,
  emailId: string,
  participants: number[],
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${eventId}/emails/send/${emailId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participants,
      }),
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[sendMail action] Failed to send mail for event ${eventId}:`,
      error,
    );
    if (response.status === 500) {
      return {
        success: false,
        error: "Serwer nie działa poprawnie. Spróbuj ponownie później",
      };
    }
    return { success: false };
  }
  return { success: true };
}
