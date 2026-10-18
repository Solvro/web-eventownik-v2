import { decodeJwt } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { API_URL } from "@/lib/api";
import { encrypt, verifySession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const session = await verifySession();
  const loginUrl = new URL("/auth/login", request.nextUrl);
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
  const login = () => {
    const response = NextResponse.redirect(loginUrl, 303);
    // Drop the unusable session: the auth layout redirects any request that
    // still carries one back to the dashboard, which would loop forever.
    response.cookies.delete("session");
    response.cookies.delete("backend-refresh");
    return response;
  };
  if (session === null || session.bearerToken.length === 0) {
    return login();
  }

  try {
    const { exp } = decodeJwt(session.bearerToken);
    if (exp !== undefined && exp * 1000 > Date.now() + 60_000) {
      return NextResponse.next();
    }
    const refreshToken = request.cookies.get("backend-refresh")?.value;
    if (refreshToken === undefined || refreshToken === "") {
      return login();
    }
    const refreshed = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
    });
    if (!refreshed.ok) {
      return login();
    }
    const data = (await refreshed.json()) as { access_token: string };
    const tokenCookie = refreshed.headers
      .getSetCookie()
      .find((value) => value.startsWith("refresh_token="));
    const newRefresh = tokenCookie
      ?.split(";")[0]
      ?.slice("refresh_token=".length);
    if (newRefresh === undefined || newRefresh === "") {
      return login();
    }
    const signedSession = await encrypt({ bearerToken: data.access_token });
    request.cookies.set("session", signedSession);
    request.cookies.set("backend-refresh", newRefresh);
    const headers = new Headers(request.headers);
    headers.set("cookie", request.cookies.toString());
    // Forward the renewed session to this same request, including server actions.
    const response = NextResponse.next({ request: { headers } });
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    };
    response.cookies.set("session", signedSession, options);
    response.cookies.set("backend-refresh", newRefresh, options);
    return response;
  } catch {
    return login();
  }
}

export const config = { matcher: ["/dashboard/:path*"] };
