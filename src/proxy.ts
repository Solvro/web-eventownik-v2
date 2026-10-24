import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { encrypt, sessionCookieMaxAge, verifySession } from "@/lib/session";

import { API_URL } from "./lib/api";
import { parseSetCookieHeader } from "./lib/cookies";
import type { AuthSuccessResponse } from "./types/auth";

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/auth/login", request.nextUrl);
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);

  const response = NextResponse.redirect(loginUrl);

  response.cookies.delete("refresh_token");

  return response;
}

function hasRefreshToken(request: NextRequest): boolean {
  return Boolean(request.cookies.get("refresh_token")?.value);
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const initialSession = await verifySession();

  if (initialSession === null) {
    if (!hasRefreshToken(request)) {
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return redirectToLogin(request);
      }

      return response;
    }

    try {
      const backendResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: request.headers.get("cookie") ?? "",
        },
      });

      if (backendResponse.ok) {
        const data = (await backendResponse.json()) as AuthSuccessResponse;
        const backendSetCookie = backendResponse.headers.getSetCookie();

        for (const setCookieHeader of backendSetCookie) {
          response.cookies.set(parseSetCookieHeader(setCookieHeader));
        }

        response.cookies.set({
          name: "session-v3",
          value: await encrypt({ bearerToken: data.access_token }),
          httpOnly: true,
          secure: true,
          expires: new Date(Date.now() + sessionCookieMaxAge * 1000),
          sameSite: "lax",
          path: "/",
        });
      } else {
        if (request.nextUrl.pathname.startsWith("/dashboard")) {
          return redirectToLogin(request);
        }

        response.cookies.delete("refresh_token");
      }
    } catch (error) {
      console.error("[Middleware] Failed to refresh token:", error);

      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return redirectToLogin(request);
      }

      response.cookies.delete("refresh_token");
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/auth/:path*", "/dashboard/:path*"],
};
