"use server";

import { redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { EventEmail } from "@/types/emails";
import type { Participant } from "@/types/participant";

export async function getParticipants(eventId: string) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }
  const response = await fetch(`${API_URL}/events/${eventId}/participants`, {
    method: "GET",
    headers: { Authorization: `Bearer ${session.bearerToken}` },
  });
  if (!response.ok) {
    console.error("Failed to fetch participants", response);
    return null;
  }
  const participants = (await response.json()) as Participant[];
  return participants;
}

export async function getParticipant(eventId: string, participantId: string) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }
  const response = await fetch(
    `${API_URL}/events/${eventId}/participants/${participantId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${session.bearerToken}` },
    },
  );
  if (!response.ok) {
    console.error("Failed to fetch participant", response);
    return null;
  }
  const participant = (await response.json()) as Participant;
  return participant;
}

export async function getAttributes(eventId: string) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }
  const response = await fetch(`${API_URL}/events/${eventId}/attributes`, {
    method: "GET",
    headers: { Authorization: `Bearer ${session.bearerToken}` },
  });
  if (!response.ok) {
    console.error("Failed to fetch attributes", response);
    return null;
  }
  const attributes = (await response.json()) as Attribute[];
  return attributes;
}

async function getBlockData(
  eventId: string,
  attributeId: string,
  bearerToken: string,
) {
  const response = await fetch(
    `${API_URL}/events/${eventId}/attributes/${attributeId}/blocks`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  if (!response.ok) {
    console.error(
      `Failed to fetch blocks of attribute ID = ${attributeId}`,
      response,
    );
    return null;
  }
  return response.json() as Promise<Block>;
}

export async function getBlocks(eventId: string, attributes: Attribute[]) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  try {
    const rootBlocksPromises = attributes
      .filter((attribute) => attribute.type === "block")
      .map(async (attribute) => {
        return getBlockData(
          eventId,
          attribute.id.toString(),
          session.bearerToken,
        );
      });

    const responses = await Promise.all(rootBlocksPromises);
    return responses;
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return null;
  }
}

export async function deleteManyParticipants(
  eventId: string,
  participants: string[],
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  const response = await fetch(`${API_URL}/events/${eventId}/participants`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ participantsToUnregisterIds: participants }),
  });

  if (!response.ok) {
    console.error(
      `[deleteManyParticipants] Failed to delete many participants for event ${eventId}:`,
      response,
    );
    if (response.status === 500) {
      return {
        success: false,
        error: "Serwer nie działa poprawnie. Spróbuj ponownie później",
      };
    }
    return {
      success: false,
      error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie",
    };
  }
  return { success: true };
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
          //multiselect case - unchecking all options in multiselect doesn't work because of this filter
          //However, I suppose there won't be many cases when it's needed (if any)
          .filter(([, value]) => value !== "")
          .map(([key, value]) => {
            return { attributeId: key, value };
          }),
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

export async function exportData(eventId: string) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${eventId}/participants/export`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    console.error("Failed to export participants", response);

    if (response.status === 404) {
      return {
        success: false,
        error: "Nie znaleziono wydarzenia lub endpoint nie istnieje.",
      };
    }
    if (response.status === 500) {
      return {
        success: false,
        error: "Serwer nie działa poprawnie. Spróbuj ponownie później.",
      };
    }
    return { success: false };
  }

  const fileBlob = await response.blob();
  return { success: true, file: fileBlob };
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
    return {
      success: false,
      error: `Błąd ${response.status.toString()} ${response.statusText}`,
    };
  }

  return { success: true };
}

export async function downloadAttributeFile(
  eventId: string,
  participantId: string,
  attributeId: string,
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${eventId}/participants/${participantId}/attributes/${attributeId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    console.error("Failed to download file from attribute", response);
    if (response.status === 404) {
      return {
        success: false,
        error: "Nie znaleziono pliku.",
      };
    }
    if (response.status === 500) {
      return {
        success: false,
        error: "Serwer nie działa poprawnie. Spróbuj ponownie później.",
      };
    }
    return { success: false };
  }

  const fileBlob = await response.blob();
  return { success: true, file: fileBlob };
}
