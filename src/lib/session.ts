import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import "server-only";

import type { SessionPayload } from "@/types/auth";

import { API_URL } from "./api";

const SECRET_KEY = process.env.SESSION_SECRET ?? "";
if (SECRET_KEY === "") {
  throw new Error("SECRET_KEY env variable is not set!!!");
}
const encodedKey = new TextEncoder().encode(SECRET_KEY);
const expirationTimeDays = 30;

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expirationTimeDays.toString()}d`)
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

export async function createSession(sessionPayload: SessionPayload) {
  const expiresAt = new Date(
    Date.now() + expirationTimeDays * 24 * 60 * 60 * 1000,
  );
  const session = await encrypt(sessionPayload);
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("backend-refresh")?.value;
  if (refreshToken !== undefined && refreshToken !== "") {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { Cookie: `refresh_token=${refreshToken}` },
      });
    } catch {
      // Local logout must still work when the backend is unavailable.
    }
  }
  cookieStore.delete("backend-refresh");
  cookieStore.delete("session");
  redirect("/");
}

export const verifySession = cache(async () => {
  const cookie = await cookies();
  const cookieSession = cookie.get("session")?.value;
  if (cookieSession !== undefined) {
    const session = await decrypt(cookieSession);

    if (session === undefined) {
      return null;
    }
    return { ...session };
  }
  return null;
});

export async function saveAuthResponse(
  response: Response,
  accessToken: string,
) {
  const refreshCookie = response.headers
    .getSetCookie()
    .find((value) => value.startsWith("refresh_token="));
  const refreshToken = refreshCookie
    ?.split(";")[0]
    ?.slice("refresh_token=".length);
  if (refreshToken === undefined || refreshToken === "") {
    throw new Error("Backend did not return a refresh token");
  }
  const cookieStore = await cookies();
  cookieStore.set("backend-refresh", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  await createSession({ bearerToken: accessToken });
}
