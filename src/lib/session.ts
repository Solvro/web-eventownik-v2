import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import "server-only";

import type { SessionPayload } from "@/types/auth";

import { API_URL } from "./api";
import { parseSetCookieHeader } from "./cookies";
import { getSessionExpiry, isAccessTokenExpiring } from "./session-expiry";

const SECRET_KEY = process.env.SESSION_SECRET ?? "";
if (SECRET_KEY === "") {
  throw new Error("SECRET_KEY env variable is not set!!!");
}
const encodedKey = new TextEncoder().encode(SECRET_KEY);

const sessionCookieMaxAgeString = process.env.SESSION_COOKIE_MAX_AGE ?? "";
if (sessionCookieMaxAgeString === "") {
  throw new Error("SESSION_COOKIE_MAX_AGE env variable is not set!!!");
}

const sessionCookieMaxAge = Number.parseInt(sessionCookieMaxAgeString, 10);
if (Number.isNaN(sessionCookieMaxAge)) {
  throw new TypeError(
    "SESSION_COOKIE_MAX_AGE must be a valid number (in seconds)!!!",
  );
}

async function encrypt(payload: SessionPayload, expiresAt: Date) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(encodedKey);
}

/**
 * Builds the `session-v3` cookie for a backend access token. The session ends
 * shortly before the access token does, so the proxy refreshes it in time.
 */
export async function createSessionCookie(bearerToken: string) {
  const expires = getSessionExpiry(bearerToken, sessionCookieMaxAge);

  return {
    name: "session-v3",
    value: await encrypt({ bearerToken }, expires),
    httpOnly: true,
    secure: true,
    expires,
    sameSite: "lax" as const,
    path: "/",
  };
}

async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.bearerToken !== "string" ||
      payload.bearerToken.length === 0
    ) {
      console.error(
        "[Decrypt] Failed to verify session: bearerToken is invalid",
      );
      return;
    }
    // Sessions issued before the expiry was tied to the access token can outlive it
    if (isAccessTokenExpiring(payload.bearerToken)) {
      return;
    }
    return payload as SessionPayload;
  } catch (error) {
    console.error("[Decrypt] Failed to verify session:", error);
  }
}

export async function createSession(
  sessionPayload: SessionPayload,
  backendSetCookie: string[],
) {
  const cookieStore = await cookies();

  cookieStore.set(await createSessionCookie(sessionPayload.bearerToken));

  for (const setCookieHeader of backendSetCookie) {
    cookieStore.set(parseSetCookieHeader(setCookieHeader));
  }
}

export async function logout() {
  const cookieStore = await cookies();

  try {
    const backendResponse = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    if (!backendResponse.ok) {
      console.error("[logoutAction] Failed to delete session");
    }
  } catch (error) {
    console.error(
      "[logoutAction] Failed to delete session:",
      error instanceof Error ? error.message : error,
    );
  }

  cookieStore.delete("refresh_token");
  cookieStore.delete("session-v3");

  redirect("/");
}

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const cookieSession = cookieStore.get("session-v3")?.value;

  if (cookieSession !== undefined) {
    const session = await decrypt(cookieSession);

    if (session !== undefined) {
      return { ...session };
    }
  }

  return null;
});
