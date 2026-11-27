"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { isValidUuid } from "@/lib/is-valid-uuid";
import { verifySession } from "@/lib/session";
import type {
  MobileAppConfig,
  MobileAppConfigPayload,
  MobileBerealPost,
  MobileBerealRoundAdmin,
  MobileBingoCompletionAdmin,
  MobileBingoTaskAdmin,
  MobileChatMessage,
  MobileFaqItem,
  MobileFaqItemPayload,
  MobileNotification,
  MobileNotificationPayload,
  MobileScheduleItem,
  MobileScheduleItemPayload,
  MobileSosContact,
  MobileSosContactPayload,
  MobileTinderOverview,
  MobileTinderParticipantSwipes,
} from "@/types/mobile";

export type MobileActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null && "message" in body) {
    const { message } = body;
    if (typeof message === "string") {
      return message;
    }
    if (Array.isArray(message)) {
      return message.join(", ");
    }
  }
  return fallback;
}

/** Calls an organizer endpoint under /events/:eventUuid/mobile */
async function mobileRequest<T>(
  eventUuid: string,
  path: string,
  init: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    json?: unknown;
  },
  identifiers: string[] = [],
): Promise<MobileActionResult<T>> {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  if (!isValidUuid(eventUuid) || identifiers.some((id) => !isValidUuid(id))) {
    return { success: false, error: "Invalid identifier" };
  }

  const method = init.method ?? "GET";
  try {
    const response = await fetch(
      `${API_URL}/events/${encodeURIComponent(eventUuid)}/mobile${path}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${session.bearerToken}`,
          ...(init.json === undefined
            ? {}
            : { "Content-Type": "application/json" }),
        },
        body: init.json === undefined ? undefined : JSON.stringify(init.json),
        cache: "no-store",
      },
    );

    const text = await response.text();
    let body: unknown = null;
    if (text !== "") {
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        body = text;
      }
    }

    if (!response.ok) {
      console.error(
        `[mobile action] ${method} ${path} failed for event ${eventUuid}:`,
        response.status,
        body,
      );
      return {
        success: false,
        error: getErrorMessage(
          body,
          `${response.status.toString()} ${response.statusText}`,
        ),
      };
    }

    if (method !== "GET") {
      revalidatePath(`/dashboard/events/${eventUuid}/mobile`);
    }

    return { success: true, data: body as T };
  } catch (error) {
    console.error(
      `[mobile action] ${method} ${path} threw for event ${eventUuid}:`,
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Config ---------------------------------------------------------------------

export async function getMobileConfig(eventUuid: string) {
  return mobileRequest<MobileAppConfig>(eventUuid, "", {});
}

export async function updateMobileConfig(
  eventUuid: string,
  payload: MobileAppConfigPayload,
) {
  return mobileRequest<MobileAppConfig>(eventUuid, "", {
    method: "PUT",
    json: payload,
  });
}

// Generic CRUD lists ---------------------------------------------------------

type CrudResource = "sos-contacts" | "faq" | "schedule";

interface CrudTypes {
  "sos-contacts": { item: MobileSosContact; payload: MobileSosContactPayload };
  faq: { item: MobileFaqItem; payload: MobileFaqItemPayload };
  schedule: { item: MobileScheduleItem; payload: MobileScheduleItemPayload };
}

const CRUD_RESOURCES = new Set<string>(["sos-contacts", "faq", "schedule"]);

function invalidResource<T>(): MobileActionResult<T> {
  return { success: false, error: "Invalid resource" };
}

export async function listMobileItems<R extends CrudResource>(
  eventUuid: string,
  resource: R,
) {
  if (!CRUD_RESOURCES.has(resource)) {
    return invalidResource<CrudTypes[R]["item"][]>();
  }
  return mobileRequest<CrudTypes[R]["item"][]>(eventUuid, `/${resource}`, {});
}

export async function createMobileItem<R extends CrudResource>(
  eventUuid: string,
  resource: R,
  payload: CrudTypes[R]["payload"],
) {
  if (!CRUD_RESOURCES.has(resource)) {
    return invalidResource<CrudTypes[R]["item"]>();
  }
  return mobileRequest<CrudTypes[R]["item"]>(eventUuid, `/${resource}`, {
    method: "POST",
    json: payload,
  });
}

export async function updateMobileItem<R extends CrudResource>(
  eventUuid: string,
  resource: R,
  itemUuid: string,
  payload: Partial<CrudTypes[R]["payload"]>,
) {
  if (!CRUD_RESOURCES.has(resource)) {
    return invalidResource<CrudTypes[R]["item"]>();
  }
  return mobileRequest<CrudTypes[R]["item"]>(
    eventUuid,
    `/${resource}/${encodeURIComponent(itemUuid)}`,
    { method: "PATCH", json: payload },
    [itemUuid],
  );
}

export async function deleteMobileItem(
  eventUuid: string,
  resource: CrudResource,
  itemUuid: string,
) {
  if (!CRUD_RESOURCES.has(resource)) {
    return invalidResource<unknown>();
  }
  return mobileRequest<unknown>(
    eventUuid,
    `/${resource}/${encodeURIComponent(itemUuid)}`,
    { method: "DELETE" },
    [itemUuid],
  );
}

// Notifications --------------------------------------------------------------

export async function getMobileNotifications(eventUuid: string) {
  return mobileRequest<MobileNotification[]>(eventUuid, "/notifications", {});
}

export async function sendMobileNotification(
  eventUuid: string,
  payload: MobileNotificationPayload,
) {
  return mobileRequest<MobileNotification>(eventUuid, "/notifications", {
    method: "POST",
    json: payload,
  });
}

export async function deleteMobileNotification(
  eventUuid: string,
  notificationUuid: string,
) {
  return mobileRequest<unknown>(
    eventUuid,
    `/notifications/${encodeURIComponent(notificationUuid)}`,
    { method: "DELETE" },
    [notificationUuid],
  );
}

// Tinderownik ----------------------------------------------------------------

export async function getTinderOverview(eventUuid: string) {
  return mobileRequest<MobileTinderOverview>(eventUuid, "/tinder", {});
}

export async function getTinderParticipantSwipes(
  eventUuid: string,
  participantUuid: string,
) {
  return mobileRequest<MobileTinderParticipantSwipes>(
    eventUuid,
    `/tinder/participants/${encodeURIComponent(participantUuid)}`,
    {},
    [participantUuid],
  );
}

// Bingo ----------------------------------------------------------------------

export async function getBingoCompletions(
  eventUuid: string,
  taskUuid: string | null,
) {
  return mobileRequest<MobileBingoCompletionAdmin[]>(
    eventUuid,
    taskUuid === null
      ? "/bingo-completions"
      : `/bingo-completions?taskUuid=${encodeURIComponent(taskUuid)}`,
    {},
    taskUuid === null ? [] : [taskUuid],
  );
}

export async function deleteBingoCompletion(
  eventUuid: string,
  completionUuid: string,
) {
  return mobileRequest<unknown>(
    eventUuid,
    `/bingo-completions/${encodeURIComponent(completionUuid)}`,
    { method: "DELETE" },
    [completionUuid],
  );
}

export async function getBingoTasks(eventUuid: string) {
  return mobileRequest<MobileBingoTaskAdmin[]>(eventUuid, "/bingo-tasks", {});
}

export async function createBingoTask(eventUuid: string, text: string) {
  return mobileRequest<MobileBingoTaskAdmin>(eventUuid, "/bingo-tasks", {
    method: "POST",
    json: { text },
  });
}

export async function createBingoTasksBulk(eventUuid: string, texts: string[]) {
  return mobileRequest<unknown>(eventUuid, "/bingo-tasks/bulk", {
    method: "POST",
    json: { texts },
  });
}

export async function updateBingoTask(
  eventUuid: string,
  taskUuid: string,
  text: string,
) {
  return mobileRequest<MobileBingoTaskAdmin>(
    eventUuid,
    `/bingo-tasks/${encodeURIComponent(taskUuid)}`,
    { method: "PATCH", json: { text } },
    [taskUuid],
  );
}

export async function deleteBingoTask(eventUuid: string, taskUuid: string) {
  return mobileRequest<unknown>(
    eventUuid,
    `/bingo-tasks/${encodeURIComponent(taskUuid)}`,
    { method: "DELETE" },
    [taskUuid],
  );
}

// BeReal ---------------------------------------------------------------------

export async function getBerealRounds(eventUuid: string) {
  return mobileRequest<MobileBerealRoundAdmin[]>(
    eventUuid,
    "/bereal-rounds",
    {},
  );
}

export async function startBerealRound(
  eventUuid: string,
  payload: { prompt?: string; durationMinutes?: number },
) {
  return mobileRequest<MobileBerealRoundAdmin>(eventUuid, "/bereal-rounds", {
    method: "POST",
    json: payload,
  });
}

export async function deleteBerealRound(eventUuid: string, roundUuid: string) {
  return mobileRequest<unknown>(
    eventUuid,
    `/bereal-rounds/${encodeURIComponent(roundUuid)}`,
    { method: "DELETE" },
    [roundUuid],
  );
}

export async function getBerealRoundPosts(
  eventUuid: string,
  roundUuid: string,
) {
  return mobileRequest<MobileBerealPost[]>(
    eventUuid,
    `/bereal-rounds/${encodeURIComponent(roundUuid)}/posts`,
    {},
    [roundUuid],
  );
}

export async function deleteBerealPost(eventUuid: string, postUuid: string) {
  return mobileRequest<unknown>(
    eventUuid,
    `/bereal-posts/${encodeURIComponent(postUuid)}`,
    { method: "DELETE" },
    [postUuid],
  );
}

// Chat -----------------------------------------------------------------------

export async function getChatMessages(eventUuid: string, limit = 100) {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 200);
  return mobileRequest<MobileChatMessage[]>(
    eventUuid,
    `/chat/messages?limit=${safeLimit.toString()}`,
    {},
  );
}

export async function sendChatMessage(eventUuid: string, body: string) {
  return mobileRequest<MobileChatMessage>(eventUuid, "/chat/messages", {
    method: "POST",
    json: { body },
  });
}

export async function deleteChatMessage(
  eventUuid: string,
  messageUuid: string,
) {
  return mobileRequest<unknown>(
    eventUuid,
    `/chat/messages/${encodeURIComponent(messageUuid)}`,
    { method: "DELETE" },
    [messageUuid],
  );
}
