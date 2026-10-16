"use server";

import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import type { ExportKey, SendMailKey, TableKey } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/api";
import { attributeValue } from "@/lib/api-v3";
import {
  getBackend,
  getReferenceCollection,
  paginatedUrl,
} from "@/lib/backend";
import { isValidUuid } from "@/lib/is-valid-uuid";
import { verifySession } from "@/lib/session";
import type { Block } from "@/types/blocks";
import type { Participant, ParticipantIdentity } from "@/types/participant";
import type {
  V3Attribute as Attribute,
  V3EmailSummary as EventEmail,
} from "@/types/v3";

export interface ImportedParticipant {
  email: string;
  participantAttributes: {
    attributeUuid: string;
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

export interface ParticipantPageQuery {
  page: number;
  take: number;
  search: string;
  sort: string;
  columnFilters: Record<string, unknown[]>;
}
const INITIAL_PARTICIPANT_QUERY: ParticipantPageQuery = {
  page: 1,
  take: 20,
  search: "",
  sort: "createdAt:asc",
  columnFilters: {},
};
export async function getParticipants(
  eventUuid: string,
  query: ParticipantPageQuery = INITIAL_PARTICIPANT_QUERY,
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid)) {
    console.error(`[getParticipants] Invalid event UUID: ${eventUuid}`);
    return null;
  }

  const url = paginatedUrl(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/participants`,
    query.page,
    query.take,
  );
  if (query.search !== "") {
    url.searchParams.set("search", query.search);
  }
  url.searchParams.set("sort", query.sort);
  url.searchParams.set("columnFilters", JSON.stringify(query.columnFilters));
  return getBackend<PaginatedResponse<Participant>>(url, {
    headers: { Authorization: `Bearer ${session.bearerToken}` },
    cache: "no-store",
  });
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

export async function getParticipantSelectionPage(
  eventUuid: string,
  query: ParticipantPageQuery,
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }
  if (!isValidUuid(eventUuid)) {
    throw new Error("Invalid event UUID");
  }
  const url = paginatedUrl(
    `${API_URL}/events/${eventUuid}/participants/selection`,
    query.page,
    query.take,
  );
  url.searchParams.set("search", query.search);
  url.searchParams.set("sort", query.sort);
  url.searchParams.set("columnFilters", JSON.stringify(query.columnFilters));
  return getBackend<PaginatedResponse<ParticipantIdentity>>(url, {
    headers: { Authorization: `Bearer ${session.bearerToken}` },
    cache: "no-store",
  });
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

  return getReferenceCollection<Attribute>(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes`,
    {
      headers: { Authorization: `Bearer ${session.bearerToken}` },
      cache: "no-store",
    },
  );
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
  const block = (await response.json()) as Block | [];
  return Array.isArray(block) ? null : block;
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
      error: { key: "invalidUuid" as TableKey },
    };
  }

  for (let offset = 0; offset < participants.length; offset += 500) {
    const response = await fetch(
      `${API_URL}/events/${encodeURIComponent(eventUuid)}/participants/unregister-many`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantsToUnregisterIds: participants.slice(offset, offset + 500),
        }),
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
  participantUuid: string,
  payload: {
    participantAttributes?: Record<string, string>;
    [key: string]: unknown;
  },
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  const { participantAttributes, ...baseFields } = payload;
  const attributes = await getAttributes(eventUuid);
  if (attributes === null) {
    return { success: false };
  }

  const response = await fetch(
    `${API_URL}/events/${eventUuid}/participants/${participantUuid}`,
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
              return {
                attributeUuid: key,
                value: attributeValue(
                  attributes.find((attribute) => attribute.uuid === key)
                    ?.type ?? "text",
                  value,
                ),
              };
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
  eventUuid: string,
  participants: ImportedParticipant[],
  bearerToken: string,
) {
  const attributes = await getAttributes(eventUuid);
  if (attributes === null) {
    return Response.json(
      { message: "Could not load attributes" },
      { status: 502 },
    );
  }
  const skippedParticipants: NonNullable<
    ImportParticipantsResponse["skippedParticipants"]
  > = [];
  let imported = 0;
  const seen = new Set<string>();
  for (const participant of participants) {
    if (seen.has(participant.email)) {
      skippedParticipants.push({
        email: participant.email,
        reason: "duplicate_in_file",
      });
      continue;
    }
    seen.add(participant.email);
    try {
      const response = await fetch(
        `${API_URL}/events/${eventUuid}/participants`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...participant,
            participantAttributes: participant.participantAttributes.map(
              (item) => ({
                ...item,
                value: attributeValue(
                  attributes.find(
                    (attribute) => attribute.uuid === item.attributeUuid,
                  )?.type ?? "text",
                  item.value,
                ),
              }),
            ),
          }),
        },
      );
      if (response.ok) {
        imported++;
      } else {
        skippedParticipants.push({
          email: participant.email,
          reason: response.status === 409 ? "already_exists" : "failed",
          message: await response.text(),
        });
      }
    } catch {
      skippedParticipants.push({ email: participant.email, reason: "failed" });
    }
  }
  return Response.json(
    { skippedParticipants },
    { status: imported > 0 ? 200 : 400 },
  );
}

export async function bulkUpdateParticipantAttribute(
  eventUuid: string,
  participantIds: string[],
  attributeUuid: string,
  value: string,
) {
  const ids = [...new Set(participantIds)];
  const session = await verifySession();
  if (
    session === null ||
    !isValidUuid(eventUuid) ||
    !isValidUuid(attributeUuid) ||
    ids.some((id) => !isValidUuid(id))
  ) {
    return { failedCount: ids.length };
  }
  const attributes = await getAttributes(eventUuid);
  const attribute = attributes?.find((item) => item.uuid === attributeUuid);
  if (
    attribute === undefined ||
    attribute.type === "file" ||
    attribute.type === "drawing"
  ) {
    return { failedCount: ids.length };
  }
  const newValue = attributeValue(attribute.type, value);
  let failedCount = 0;
  for (let offset = 0; offset < ids.length; offset += 500) {
    const batchIds = ids.slice(offset, offset + 500);
    try {
      const response = await fetch(
        `${API_URL}/events/${eventUuid}/participants/attributes/${attributeUuid}/bulk-update`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.bearerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ participantIds: batchIds, newValue }),
        },
      );
      if (!response.ok) {
        failedCount += batchIds.length;
      }
    } catch {
      failedCount += batchIds.length;
    }
  }
  return { failedCount };
}

export async function importParticipants(
  eventUuid: string,
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
    eventUuid,
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
      `[importParticipants] Failed to import participants for event ${eventUuid}:`,
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

  return getReferenceCollection<EventEmail>(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/emails`,
    {
      headers: { Authorization: `Bearer ${session.bearerToken}` },
      cache: "no-store",
    },
  );
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
      error: { key: "invalidUuid" as ExportKey },
    };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/import-export/participants`,
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
  emailUuid: string,
  participants: string[],
) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid) || !isValidUuid(emailUuid)) {
    console.error(
      `[sendMail] Invalid UUID: eventUuid=${eventUuid}, emailUuid=${emailUuid}`,
    );
    return {
      success: false,
      error: { key: "invalidUuid" as SendMailKey },
    };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/emails/${encodeURIComponent(emailUuid)}/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participantUuids: participants,
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
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/participants/${encodeURIComponent(participantId)}/attributes/${encodeURIComponent(attributeUuid)}/download`,
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
