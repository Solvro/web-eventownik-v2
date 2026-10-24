"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import type { EventDetailsKey } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import { isValidUuid } from "@/lib/is-valid-uuid";
import { verifySession } from "@/lib/session";
import { getNextCopyName } from "@/lib/utils";
import type { Block } from "@/types/blocks";

export async function reorderBlockAttributes(
  eventUuid: string,
  orderedIds: string[],
) {
  const session = await verifySession();

  if (session == null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid) || orderedIds.some((id) => !isValidUuid(id))) {
    return {
      success: false,
      error: { key: "invalidIdentifier" as EventDetailsKey },
    };
  }

  const { bearerToken } = session;

  //TODO: as soon as backend exposes an endpoint for reordering block attributes, replace this with a single request
  const results = await Promise.all(
    orderedIds.map(async (id, index) =>
      fetch(
        `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({ order: index }),
        },
      ),
    ),
  );

  const failed = results.find((r) => !r.ok);
  if (failed !== undefined) {
    console.error(
      `[reorderBlockAttributes action] Failed to reorder block attributes for event ${eventUuid}`,
    );
    return {
      success: false,
      error: {
        key: "httpError" as EventDetailsKey,
        values: {
          status: failed.status,
          statusText: failed.statusText,
        },
      },
    };
  }

  return { success: true };
}

export async function createBlock(
  eventUuid: string,
  attributeUuid: string,
  parentUuid: string,
  name: string,
  description: string | null,
  capacity: number | null,
) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  if (
    !isValidUuid(eventUuid) ||
    !isValidUuid(attributeUuid) ||
    !isValidUuid(parentUuid)
  ) {
    return {
      success: false,
      error: { key: "invalidIdentifier" as EventDetailsKey },
    };
  }

  const { bearerToken } = session;

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes/${encodeURIComponent(attributeUuid)}/blocks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parentUuid,
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
      `[createBlock action] Failed to create a block for event ${eventUuid}:`,
      error,
    );
    return {
      success: false,
      error: {
        key: "httpError" as EventDetailsKey,
        values: {
          status: response.status,
          statusText: response.statusText,
        },
      },
    };
  }
}

export async function updateBlock(
  eventUuid: string,
  attributeUuid: string,
  blockUuid: string,
  name: string,
  description: string | null,
  capacity: number | null,
) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  if (
    !isValidUuid(eventUuid) ||
    !isValidUuid(attributeUuid) ||
    !isValidUuid(blockUuid)
  ) {
    return {
      success: false,
      error: { key: "invalidIdentifier" as EventDetailsKey },
    };
  }

  const { bearerToken } = session;

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes/${encodeURIComponent(attributeUuid)}/blocks/${encodeURIComponent(blockUuid)}`,
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
      `[updateBlock action] Failed to update block ${blockUuid} for event ${eventUuid}:`,
      error,
    );
    return {
      success: false,
      error: {
        key: "httpError" as EventDetailsKey,
        values: {
          status: response.status,
          statusText: response.statusText,
        },
      },
    };
  }
}

export async function reorderBlocks(
  eventUuid: string,
  attributeUuid: string,
  orderedIds: string[],
) {
  const session = await verifySession();

  if (session == null) {
    redirect("/auth/login");
  }

  if (
    !isValidUuid(eventUuid) ||
    !isValidUuid(attributeUuid) ||
    orderedIds.some((uuid) => !isValidUuid(uuid))
  ) {
    return {
      success: false,
      error: { key: "invalidIdentifier" as EventDetailsKey },
    };
  }

  const { bearerToken } = session;

  const results = await Promise.all(
    orderedIds.map(async (uuid, index) =>
      fetch(
        `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes/${encodeURIComponent(attributeUuid)}/blocks/${encodeURIComponent(uuid)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({ order: index }),
        },
      ),
    ),
  );

  const failed = results.find((r) => !r.ok);
  if (failed !== undefined) {
    console.error(
      `[reorderBlocks action] Failed to reorder blocks for event ${eventUuid}`,
    );
    return {
      success: false,
      error: {
        key: "httpError" as EventDetailsKey,
        values: {
          status: failed.status,
          statusText: failed.statusText,
        },
      },
    };
  }

  return { success: true };
}

export async function deleteBlock(
  eventUuid: string,
  blockUuid: string,
  attributeUuid: string,
) {
  const session = await verifySession();

  if (session == null) {
    redirect("/auth/login");
  }

  if (
    !isValidUuid(eventUuid) ||
    !isValidUuid(blockUuid) ||
    !isValidUuid(attributeUuid)
  ) {
    return {
      success: false,
      error: { key: "invalidIdentifier" as EventDetailsKey },
    };
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes/${encodeURIComponent(attributeUuid)}/blocks/${encodeURIComponent(blockUuid)}`,
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
      `[deleteBlock action] Failed to delete block ${blockUuid} for event ${eventUuid}:`,
      error,
    );
    return {
      success: false,
      error: {
        key: "httpError" as EventDetailsKey,
        values: {
          status: response.status,
          statusText: response.statusText,
        },
      },
    };
  }

  return { success: true };
}

export async function duplicateBlock(
  eventUuid: string,
  attributeUuid: string,
  blockUuid: string,
  sourceName: string,
) {
  const session = await verifySession();
  if (session == null) {
    return { success: false };
  }

  if (
    !isValidUuid(eventUuid) ||
    !isValidUuid(attributeUuid) ||
    !isValidUuid(blockUuid)
  ) {
    return {
      success: false,
      error: { key: "invalidIdentifier" as EventDetailsKey },
    };
  }

  const blocksUrl = `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes/${encodeURIComponent(attributeUuid)}/blocks`;
  const headers = {
    Authorization: `Bearer ${session.bearerToken}`,
    "Content-Type": "application/json",
  };

  const treeResponse = await fetch(blocksUrl, { headers });
  if (!treeResponse.ok) {
    console.warn(
      `[duplicateBlock action] Failed to fetch sibling block names for block ${blockUuid}, the copy number may repeat:`,
      await treeResponse.text(),
    );
  }
  const rootBlock = treeResponse.ok
    ? ((await treeResponse.json()) as Block | [])
    : [];
  const siblings = Array.isArray(rootBlock) ? [] : rootBlock.children;

  const response = await fetch(
    `${blocksUrl}/${encodeURIComponent(blockUuid)}/duplicate`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: getNextCopyName(
          sourceName,
          siblings.map((block) => block.name),
          (await getLocale()) === "en",
        ),
      }),
    },
  );

  if (!response.ok) {
    console.error(
      `[duplicateBlock action] Failed to duplicate block ${blockUuid} for event ${eventUuid}:`,
      await response.text(),
    );
    return { success: false };
  }

  // The copy keeps the source's order, so it would land right after it. Move it to the front instead
  const newBlock = (await response.json()) as { uuid: string };
  if (siblings.length > 0) {
    const reorderResult = await reorderBlocks(eventUuid, attributeUuid, [
      newBlock.uuid,
      ...siblings.map((block) => block.uuid),
    ]);
    if (!reorderResult.success) {
      console.warn(
        `[duplicateBlock action] Failed to move the copy of block ${blockUuid} to the front`,
      );
    }
  }

  return { success: true };
}
