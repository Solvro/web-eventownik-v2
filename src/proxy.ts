import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { encrypt, sessionCookieMaxAge, verifySession } from "@/lib/session";

import { API_URL } from "./lib/api";
import { parseSetCookieHeader } from "./lib/cookies";
import type { AuthSuccessResponse } from "./types/auth";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const initialSession = await verifySession();

  if (initialSession === null) {
    try {
      const backendResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: request.headers.get("cookie") ?? "",
        },
      });

      if (backendResponse.ok) {
        const data = (await backendResponse.json()) as AuthSuccessResponse;
        const setCookieHeader = backendResponse.headers.get("set-cookie");

        if (setCookieHeader != null) {
          response.cookies.set(parseSetCookieHeader(setCookieHeader));
        }

        response.cookies.set({
          name: "session",
          value: await encrypt({ bearerToken: data.access_token }),
          httpOnly: true,
          secure: true,
          expires: new Date(Date.now() + sessionCookieMaxAge * 1000),
          sameSite: "lax",
          path: "/",
        });
      } else {
        if (request.nextUrl.pathname.startsWith("/dashboard")) {
          const loginUrl = new URL("/auth/login", request.nextUrl);
          loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);

          const redirectResponse = NextResponse.redirect(loginUrl);

          redirectResponse.cookies.delete("refresh_token");
          redirectResponse.cookies.delete("session");

          return redirectResponse;
        }
      }
    } catch (error) {
      console.error("[Middleware] Failed to refresh token:", error);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
