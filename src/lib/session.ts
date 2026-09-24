import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import "server-only";

import type { SessionPayload } from "@/types/auth";

import { API_URL } from "./api";
import { parseSetCookieHeader } from "./cookies";

const SECRET_KEY = process.env.SESSION_SECRET ?? "";
if (SECRET_KEY === "") {
  throw new Error("SECRET_KEY env variable is not set!!!");
}
const encodedKey = new TextEncoder().encode(SECRET_KEY);

const sessionCookieMaxAgeString = process.env.SESSION_COOKIE_MAX_AGE ?? "";
if (sessionCookieMaxAgeString === "") {
  throw new Error("SESSION_COOKIE_MAX_AGE env variable is not set!!!");
}

export const sessionCookieMaxAge = Number.parseInt(
  sessionCookieMaxAgeString,
  10,
);
if (Number.isNaN(sessionCookieMaxAge)) {
  throw new TypeError(
    "SESSION_COOKIE_MAX_AGE must be a valid number (in seconds)!!!",
  );
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionCookieMaxAgeString}s`)
    .sign(encodedKey);
}

async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.error("Failed to verify session", error);
  }
}

export async function createSession(
  sessionPayload: SessionPayload,
  backendSetCookie: string | null,
) {
  const expiresAt = new Date(Date.now() + sessionCookieMaxAge * 1000);
  const session = await encrypt(sessionPayload);
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  if (backendSetCookie !== null) {
    cookieStore.set(parseSetCookieHeader(backendSetCookie));
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
  cookieStore.delete("session");

  redirect("/");
}

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const cookieSession = cookieStore.get("session")?.value;

  if (cookieSession !== undefined) {
    const session = await decrypt(cookieSession);

    if (session !== undefined) {
      return { ...session };
    }
  }

  return null;
});
