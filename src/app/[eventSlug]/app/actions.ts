"use server";

import {
  clearMobileToken,
  isValidMobileSlug,
  mobileApiUrl,
  setMobileToken,
} from "@/lib/mobile/session";
import type { MobileOtpVerifyResponse } from "@/types/mobile";

export type OtpActionResult =
  | { ok: true; hasProfile: boolean }
  | { ok: false; error: string };

function readMessage(body: unknown): string | null {
  if (typeof body === "object" && body !== null && "message" in body) {
    const { message } = body;
    if (typeof message === "string") {
      return message;
    }
    if (Array.isArray(message)) {
      return message.join(", ");
    }
  }
  return null;
}

export async function requestOtp(
  eventSlug: string,
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isValidMobileSlug(eventSlug)) {
    return { ok: false, error: "Nieprawidłowe wydarzenie." };
  }
  try {
    const response = await fetch(mobileApiUrl(eventSlug, "auth/otp/request"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
      cache: "no-store",
    });
    if (response.status === 429) {
      return {
        ok: false,
        error: "Za dużo prób. Odczekaj chwilę i spróbuj ponownie.",
      };
    }
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      return {
        ok: false,
        error: readMessage(body) ?? "Nie udało się wysłać kodu.",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Brak połączenia z serwerem." };
  }
}

export async function verifyOtp(
  eventSlug: string,
  email: string,
  code: string,
): Promise<OtpActionResult> {
  if (!isValidMobileSlug(eventSlug)) {
    return { ok: false, error: "Nieprawidłowe wydarzenie." };
  }
  try {
    const response = await fetch(mobileApiUrl(eventSlug, "auth/otp/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      cache: "no-store",
    });
    if (response.status === 400 || response.status === 401) {
      return {
        ok: false,
        error: "Kod jest nieprawidłowy lub wygasł. Spróbuj ponownie.",
      };
    }
    if (response.status === 429) {
      return {
        ok: false,
        error: "Za dużo prób. Poproś o nowy kod za chwilę.",
      };
    }
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      return {
        ok: false,
        error: readMessage(body) ?? "Nie udało się zalogować.",
      };
    }
    const data = (await response.json()) as MobileOtpVerifyResponse;
    await setMobileToken(eventSlug, data.token);
    return { ok: true, hasProfile: data.profile !== null };
  } catch {
    return { ok: false, error: "Brak połączenia z serwerem." };
  }
}

export async function logout(eventSlug: string): Promise<void> {
  if (!isValidMobileSlug(eventSlug)) {
    return;
  }
  await clearMobileToken(eventSlug);
}
