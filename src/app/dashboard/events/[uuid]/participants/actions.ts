"use server";

import { redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { isValidUuid } from "@/lib/is-valid-uuid";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { EventEmail } from "@/types/emails";
import type { Participant } from "@/types/participant";

export async function getParticipants(eventUuid: string) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid)) {
    console.error(`[getParticipants] Invalid event UUID: ${eventUuid}`);
    return null;
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/participants`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${session.bearerToken}` },
    },
  );
  if (!response.ok) {
    console.error("Failed to fetch participants", response);
    return null;
  }
  const participants = (await response.json()) as Participant[];
  return participants;
}

export async function getParticipant(
  eventUuid: string,
  participantUuid: string,
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid) || !isValidUuid(participantUuid)) {
    console.error(
      `[getParticipant] Invalid UUID: eventUuid=${eventUuid}, participantId=${participantUuid}`,
    );
    return null;
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/participants/${encodeURIComponent(participantUuid)}`,
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

export async function getAttributes(eventUuid: string) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid)) {
    console.error(`[getAttributes] Invalid event UUID: ${eventUuid}`);
    return null;
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${session.bearerToken}` },
    },
  );
  if (!response.ok) {
    console.error("Failed to fetch attributes", response);
    return null;
  }
  const attributes = (await response.json()) as Attribute[];
  return attributes;
}

async function getBlockData(
  eventUuid: string,
  attributeUuid: string,
  bearerToken: string,
) {
  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes/${encodeURIComponent(attributeUuid)}/blocks`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  if (!response.ok) {
    console.error(
      `Failed to fetch blocks of attribute ID = ${attributeUuid}`,
      response,
    );
    return null;
  }
  return response.json() as Promise<Block>;
}

export async function getBlocks(eventUuid: string, attributes: Attribute[]) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid)) {
    console.error(`[getBlocks] Invalid event UUID: ${eventUuid}`);
    return null;
  }

  try {
    const rootBlocksPromises = attributes
      .filter((attribute) => attribute.type === "block")
      .filter((attribute) => isValidUuid(attribute.uuid))
      .map(async (attribute) => {
        return getBlockData(eventUuid, attribute.uuid, session.bearerToken);
      });

    const responses = await Promise.all(rootBlocksPromises);
    return responses;
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return null;
  }
}

export async function deleteManyParticipants(
  eventUuid: string,
  participants: string[],
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid)) {
    console.error(`[deleteManyParticipants] Invalid event UUID: ${eventUuid}`);
    return {
      success: false,
      error: "Nieprawidłowy identyfikator wydarzenia",
    };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/participants`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ participantsToUnregisterIds: participants }),
    },
  );

  if (!response.ok) {
    console.error(
      `[deleteManyParticipants] Failed to delete many participants for event ${eventUuid}:`,
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
  eventUuid: string,
  participantUuid: string,
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid) || !isValidUuid(participantUuid)) {
    console.error(
      `[deleteParticipant] Invalid UUID: eventUuid=${eventUuid}, participantUuid=${participantUuid}`,
    );
    return { success: false };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/participants/${encodeURIComponent(participantUuid)}`,
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
  values: Record<number, unknown>,
  eventUuid: string,
  participantId: string,
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid) || !isValidUuid(participantId)) {
    console.error(
      `[updateParticipant] Invalid UUID: eventUuid=${eventUuid}, participantId=${participantId}`,
    );
    return { success: false };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/participants/${encodeURIComponent(participantId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participantAttributes: Object.entries(values)
          //multiselect case - unchecking all options in multiselect doesn't work because of this filter
          //However, I suppose there won't be many cases when it's needed (if any)
          .map(([key, value]) => {
            return { attributeUuid: key, value: value === "" ? null : value };
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

export async function getEmails(eventUuid: string) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid)) {
    console.error(`[getEmails] Invalid event UUID: ${eventUuid}`);
    return null;
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/emails`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    console.error("Failed to fetch mails", response);
    return null;
  }
  const mails = (await response.json()) as EventEmail[];
  return mails;
}

export async function exportData(eventUuid: string) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid)) {
    console.error(`[exportData] Invalid event UUID: ${eventUuid}`);
    return {
      success: false,
      error: "Nieprawidłowy identyfikator wydarzenia",
    };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/participants/export`,
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
  eventUuid: string,
  emailId: string,
  participants: string[],
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid) || !isValidUuid(emailId)) {
    console.error(
      `[sendMail] Invalid UUID: eventUuid=${eventUuid}, emailId=${emailId}`,
    );
    return {
      success: false,
      error: "Nieprawidłowy identyfikator",
    };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/emails/send/${encodeURIComponent(emailId)}`,
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
      `[sendMail action] Failed to send mail for event ${eventUuid}:`,
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
  eventUuid: string,
  participantId: string,
  attributeUuid: string,
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (
    !isValidUuid(eventUuid) ||
    !isValidUuid(participantId) ||
    !isValidUuid(attributeUuid)
  ) {
    console.error(
      `[downloadAttributeFile] Invalid UUID: eventUuid=${eventUuid}, participantId=${participantId}, attributeUuid=${attributeUuid}`,
    );
    return { success: false };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/participants/${encodeURIComponent(participantId)}/attributes/${encodeURIComponent(attributeUuid)}`,
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
