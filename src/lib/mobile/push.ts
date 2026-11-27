/**
 * Browser side of Web Push for the participant app: a push-only service
 * worker served per event at /<slug>/app/sw.js and scoped to /<slug>/app.
 */
import { MobileApiError, mobileApi } from "@/lib/mobile/client";
import type { MobilePushConfig } from "@/types/mobile";

export type PushSupport =
  | "supported"
  /** iPhone/iPad in a browser tab: push works only in the installed app */
  | "ios-needs-install"
  | "unsupported";

export function workerScope(eventSlug: string): string {
  return `/${eventSlug}/app`;
}

function workerUrl(eventSlug: string): string {
  return `/${eventSlug}/app/sw.js`;
}

export function isStandalone(): boolean {
  const iosStandalone =
    "standalone" in navigator &&
    (navigator as { standalone?: boolean }).standalone === true;
  return (
    iosStandalone || globalThis.matchMedia("(display-mode: standalone)").matches
  );
}

export function isIos(): boolean {
  const userAgent = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    // iPadOS reports itself as a Mac
    (userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") {
    return "unsupported";
  }
  if (isIos() && !isStandalone()) {
    return "ios-needs-install";
  }
  const supported =
    globalThis.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
  return supported ? "supported" : "unsupported";
}

/** Server-side availability; an older backend without the route counts as disabled */
export async function fetchPushConfig(
  eventSlug: string,
): Promise<MobilePushConfig> {
  try {
    return await mobileApi<MobilePushConfig>(eventSlug, "push");
  } catch (error) {
    if (error instanceof MobileApiError && error.status !== 401) {
      return { enabled: false, publicKey: null };
    }
    throw error;
  }
}

async function getRegistration(
  eventSlug: string,
): Promise<ServiceWorkerRegistration | undefined> {
  return navigator.serviceWorker.getRegistration(workerScope(eventSlug));
}

/** The existing subscription of this device for this event, if any */
export async function getExistingSubscription(
  eventSlug: string,
): Promise<PushSubscription | null> {
  if (getPushSupport() !== "supported") {
    return null;
  }
  const registration = await getRegistration(eventSlug);
  // getRegistration matches by URL, so make sure it is this event's worker
  if (registration?.scope.endsWith(workerScope(eventSlug)) !== true) {
    return null;
  }
  return registration.pushManager.getSubscription();
}

function base64UrlToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded.replaceAll("-", "+").replaceAll("_", "/"));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.codePointAt(index) ?? 0;
  }
  return bytes;
}

async function waitUntilActive(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  if (registration.active !== null) {
    return;
  }
  const worker = registration.installing ?? registration.waiting;
  if (worker === null) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const onChange = () => {
      if (worker.state === "activated") {
        worker.removeEventListener("statechange", onChange);
        resolve();
      } else if (worker.state === "redundant") {
        worker.removeEventListener("statechange", onChange);
        reject(new Error("Service worker failed to install"));
      }
    };
    worker.addEventListener("statechange", onChange);
  });
}

async function sendSubscription(
  eventSlug: string,
  subscription: PushSubscription,
): Promise<void> {
  const json = subscription.toJSON();
  await mobileApi(eventSlug, "push/subscriptions", {
    method: "POST",
    json: {
      endpoint: subscription.endpoint,
      keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    },
  });
}

export async function registerPushWorker(
  eventSlug: string,
): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register(
    workerUrl(eventSlug),
    { scope: workerScope(eventSlug), updateViaCache: "none" },
  );
  await waitUntilActive(registration);
  return registration;
}

/**
 * Turns push on for this device. Must be called from a user gesture (tap),
 * since it asks for notification permission. Returns the resulting permission.
 */
export async function enablePush(
  eventSlug: string,
  publicKey: string,
): Promise<NotificationPermission> {
  // Ask first, while the tap still counts as a user gesture (Safari is strict)
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return permission;
  }
  const registration = await registerPushWorker(eventSlug);
  const key = base64UrlToUint8Array(publicKey);
  let subscription = await registration.pushManager.getSubscription();
  if (subscription !== null) {
    // A subscription made with an older server key cannot be reused
    const current = subscription.options.applicationServerKey;
    const same =
      current !== null &&
      current.byteLength === key.byteLength &&
      new Uint8Array(current).every((byte, index) => byte === key[index]);
    if (!same) {
      await subscription.unsubscribe();
      subscription = null;
    }
  }
  subscription ??= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key,
  });
  await sendSubscription(eventSlug, subscription);
  return permission;
}

/** Turns push off for this device */
export async function disablePush(eventSlug: string): Promise<void> {
  const subscription = await getExistingSubscription(eventSlug);
  if (subscription === null) {
    return;
  }
  const { endpoint } = subscription;
  await subscription.unsubscribe();
  try {
    await mobileApi(eventSlug, "push/subscriptions", {
      method: "DELETE",
      json: { endpoint },
    });
  } catch {
    // The browser subscription is gone; the server drops it on the next failed send
  }
}

function resyncKey(eventSlug: string): string {
  return `mobile-push-synced-${eventSlug}`;
}

/** Re-sends an existing subscription once per session, in case the server lost it */
export async function resyncSubscription(eventSlug: string): Promise<void> {
  try {
    if (sessionStorage.getItem(resyncKey(eventSlug)) !== null) {
      return;
    }
  } catch {
    // No session storage; resync anyway, it is idempotent
  }
  const subscription = await getExistingSubscription(eventSlug);
  if (subscription === null) {
    return;
  }
  await sendSubscription(eventSlug, subscription);
  try {
    sessionStorage.setItem(resyncKey(eventSlug), "1");
  } catch {
    // ignore
  }
}
