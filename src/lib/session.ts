import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import "server-only";

import type { SessionPayload } from "@/types/auth";

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
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
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
