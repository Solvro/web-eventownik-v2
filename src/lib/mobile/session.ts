import { cookies } from "next/headers";
import "server-only";

import { API_URL } from "@/lib/api";
import type { MobileMe, MobilePublicConfig } from "@/types/mobile";

export const MOBILE_SLUG_PATTERN = /^[A-Za-z0-9_-]+$/;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function mobileCookieName(eventSlug: string): string {
  return `mobile-session-${eventSlug}`;
}

export function mobileCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function isValidMobileSlug(eventSlug: string): boolean {
  return MOBILE_SLUG_PATTERN.test(eventSlug);
}

export async function getMobileToken(
  eventSlug: string,
): Promise<string | null> {
  if (!isValidMobileSlug(eventSlug)) {
    return null;
  }
  const store = await cookies();
  const value = store.get(mobileCookieName(eventSlug))?.value;
  return value === undefined || value === "" ? null : value;
}

export async function setMobileToken(
  eventSlug: string,
  token: string,
): Promise<void> {
  const store = await cookies();
  store.set(mobileCookieName(eventSlug), token, mobileCookieOptions());
}

export async function clearMobileToken(eventSlug: string): Promise<void> {
  const store = await cookies();
  store.delete(mobileCookieName(eventSlug));
}

export function mobileApiUrl(eventSlug: string, path = ""): string {
  const base = `${API_URL}/mobile/events/${encodeURIComponent(eventSlug)}`;
  return path === "" ? base : `${base}/${path}`;
}

export type MobileMeResult =
  | { status: "ok"; me: MobileMe }
  | { status: "unauthenticated" }
  | { status: "error" };

/** Server-side fetch of the participant's `me`. */
export async function getMobileMe(eventSlug: string): Promise<MobileMeResult> {
  const token = await getMobileToken(eventSlug);
  if (token === null) {
    return { status: "unauthenticated" };
  }
  try {
    const response = await fetch(mobileApiUrl(eventSlug, "me"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      return { status: "unauthenticated" };
    }
    if (!response.ok) {
      return { status: "error" };
    }
    return { status: "ok", me: (await response.json()) as MobileMe };
  } catch {
    return { status: "error" };
  }
}

/** Public app config; null when the app is not enabled (404) or the slug is invalid. */
export async function getMobilePublicConfig(
  eventSlug: string,
): Promise<MobilePublicConfig | null> {
  if (!isValidMobileSlug(eventSlug)) {
    return null;
  }
  const response = await fetch(mobileApiUrl(eventSlug), {
    next: { revalidate: 15 },
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(
      `Failed to load mobile config for ${eventSlug}: ${String(response.status)}`,
    );
  }
  return (await response.json()) as MobilePublicConfig;
}
