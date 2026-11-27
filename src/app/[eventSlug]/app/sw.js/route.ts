import { NextResponse } from "next/server";

import { MOBILE_SLUG_PATTERN } from "@/lib/mobile/session";

const ICON = "/assets/mobile/icon-192.png";

/**
 * Push-only service worker of the participant app. It has no fetch handler and
 * caches nothing, so it never affects how pages load (including the dashboard).
 */
function workerSource(scope: string): string {
  return `"use strict";
const SCOPE = ${JSON.stringify(scope)};
const ICON = ${JSON.stringify(ICON)};

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function safeUrl(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return SCOPE;
  }
  try {
    const url = new URL(value, self.location.origin);
    return url.origin === self.location.origin ? url.pathname + url.search + url.hash : SCOPE;
  } catch {
    return SCOPE;
  }
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    const parsed = event.data ? event.data.json() : {};
    if (parsed !== null && typeof parsed === "object") {
      data = parsed;
    }
  } catch {
    try {
      data = { body: event.data ? event.data.text() : "" };
    } catch {
      data = {};
    }
  }
  // Always show something: browsers revoke subscriptions that push silently
  const title = typeof data.title === "string" && data.title !== "" ? data.title : "Nowe powiadomienie";
  const options = {
    body: typeof data.body === "string" ? data.body : "",
    icon: ICON,
    badge: ICON,
    data: { url: safeUrl(data.url) },
  };
  if (typeof data.tag === "string" && data.tag !== "") {
    options.tag = data.tag;
  }
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = safeUrl(event.notification.data && event.notification.data.url);
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const own = windows.find((client) => {
        try {
          const path = new URL(client.url).pathname;
          return path === SCOPE || path.startsWith(SCOPE + "/");
        } catch {
          return false;
        }
      });
      if (own) {
        try {
          await own.focus();
          await own.navigate(url);
          return;
        } catch {
          // Not controlled by this worker or navigation refused; open a new window
        }
      }
      await self.clients.openWindow(url);
    })(),
  );
});
`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventSlug: string }> },
) {
  const { eventSlug } = await params;
  if (!MOBILE_SLUG_PATTERN.test(eventSlug)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const scope = `/${eventSlug}/app`;
  return new NextResponse(workerSource(scope), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache",
      "Service-Worker-Allowed": scope,
    },
  });
}
