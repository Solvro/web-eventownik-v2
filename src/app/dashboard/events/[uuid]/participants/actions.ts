"use server";

import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import type {
  ExportKey,
  SendMailKey,
  TableKey,
} from "@/i18n/translate-or-fallback";
import { API_URL } from "@/lib/api";
import { isValidUuid } from "@/lib/is-valid-uuid";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { EventEmail } from "@/types/emails";
import type { Participant } from "@/types/participant";

export interface ImportedParticipant {
  email: string;
  participantAttributes: {
    attributeId: number;
    value: string;
  }[];
}

interface ImportParticipantsResponse {
  message?: string;
  error?: string;
  errors?: { message?: string }[];
  warning?: {
    message?: string;
    emails?: string[];
  } | null;
  skippedParticipants?: {
    email: string;
    reason?: "already_exists" | "duplicate_in_file" | "failed";
    message?: string;
  }[];
}

interface SkippedParticipantMessages {
  allAlreadyExist: string;
  allDuplicatedInFile: string;
  notImported: string;
  more: (count: number) => string;
}

function formatSkippedParticipants(
  skippedParticipants: NonNullable<
    ImportParticipantsResponse["skippedParticipants"]
  >,
  messages: SkippedParticipantMessages,
) {
  const allAlreadyExist = skippedParticipants.every(
    (participant) => participant.reason === "already_exists",
  );
  if (allAlreadyExist) {
    return messages.allAlreadyExist;
  }

  const allDuplicatedInFile = skippedParticipants.every(
    (participant) => participant.reason === "duplicate_in_file",
  );
  if (allDuplicatedInFile) {
    return messages.allDuplicatedInFile;
  }

  const visibleSkippedParticipants = skippedParticipants.slice(0, 5);
  const hiddenSkippedParticipantsCount =
    skippedParticipants.length - visibleSkippedParticipants.length;
  const visibleDetails = visibleSkippedParticipants
    .map((participant) => {
      return `${participant.email}: ${
        participant.message ?? messages.notImported
      }`;
    })
    .join("\n");

  return `${visibleDetails}${
    hiddenSkippedParticipantsCount > 0
      ? `\n${messages.more(hiddenSkippedParticipantsCount)}`
      : ""
  }`;
}

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
  return participants.toSorted(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
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
        error: { key: "serverError" as TableKey },
      };
    }
    return {
      success: false,
      error: { key: "unexpectedError" as TableKey },
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
        error: { key: "serverError" as TableKey },
      };
    }
    return { success: false };
  }
  return { success: true };
}

export async function updateParticipant(
  eventUuid: string,
  participantId: string,
  payload: {
    participantAttributes?: Record<number, string>;
    [key: string]: unknown;
  },
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
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
        ...baseFields,
        ...(participantAttributes != null && {
          participantAttributes: Object.entries(participantAttributes).map(
            ([key, value]) => {
              return { attributeUuid: key, value: value === "" ? null : value };
            },
          ),
        }),
      }),
    },
  );

  if (!response.ok) {
    console.error("Failed to update user", response);
    if (response.status === 500) {
      return {
        success: false,
        error: { key: "serverError" as TableKey },
      };
    }
    return { success: false };
  }
  return { success: true };
}

async function createImportedParticipants(
  eventId: string,
  participants: ImportedParticipant[],
  bearerToken: string,
) {
  return await fetch(`${API_URL}/events/${eventId}/participants/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ participants }),
  });
}

export async function importParticipants(
  eventId: string,
  participants: ImportedParticipant[],
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  const t = await getTranslations("ImportParticipants");
  const skippedParticipantMessages: SkippedParticipantMessages = {
    allAlreadyExist: t("allParticipantsExist"),
    allDuplicatedInFile: t("allEmailsDuplicated"),
    notImported: t("notImported"),
    more: (count) => t("moreSkippedParticipants", { count }),
  };

  if (participants.length === 0) {
    return {
      success: false,
      error: t("noParticipants"),
    };
  }

  const response = await createImportedParticipants(
    eventId,
    participants,
    session.bearerToken,
  );

  if (!response.ok) {
    let error = t("httpError", {
      status: response.status,
      statusText: response.statusText,
    });
    try {
      const parsed = (await response.json()) as ImportParticipantsResponse;
      const skippedDetails =
        parsed.skippedParticipants != null &&
        parsed.skippedParticipants.length > 0
          ? formatSkippedParticipants(
              parsed.skippedParticipants,
              skippedParticipantMessages,
            )
          : null;
      const validationErrors =
        parsed.errors
          ?.map((item) => item.message)
          .filter((message) => message != null)
          .join(", ") ?? "";
      const baseError =
        parsed.message ??
        parsed.error ??
        (validationErrors === "" ? error : validationErrors);

      error =
        skippedDetails == null ? baseError : `${baseError}\n${skippedDetails}`;
    } catch {
      // Keep the HTTP status as the fallback error.
    }

    console.error(
      `[importParticipants] Failed to import participants for event ${eventId}:`,
      response,
      error,
    );

    return { success: false, error };
  }

  const parsed = (await response.json()) as ImportParticipantsResponse;
  const skippedEmails =
    parsed.warning?.emails ??
    parsed.skippedParticipants?.map((participant) => participant.email) ??
    [];

  return {
    success: true,
    warning:
      skippedEmails.length > 0
        ? {
            message: parsed.warning?.message ?? t("someParticipantsSkipped"),
            emails: skippedEmails,
            details:
              parsed.skippedParticipants == null
                ? null
                : formatSkippedParticipants(
                    parsed.skippedParticipants,
                    skippedParticipantMessages,
                  ),
          }
        : null,
  };
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
        error: { key: "eventNotFound" as ExportKey },
      };
    }
    if (response.status === 500) {
      return {
        success: false,
        error: { key: "serverError" as ExportKey },
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
      error: {
        key: "httpError" as SendMailKey,
        values: { status: response.status, statusText: response.statusText },
      },
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
        error: { key: "fileNotFound" as ExportKey },
      };
    }
    if (response.status === 500) {
      return {
        success: false,
        error: { key: "serverError" as ExportKey },
      };
    }
    return { success: false };
  }

  const fileBlob = await response.blob();
  return { success: true, file: fileBlob };
}
