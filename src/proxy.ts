import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifySession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  if (url.pathname.includes("//")) {
    url.pathname = url.pathname.replaceAll(/\/+/g, "/");
    return NextResponse.redirect(url);
  }

  const session = await verifySession();

  if (
    typeof session?.bearerToken !== "string" ||
    session.bearerToken.length === 0
  ) {
    const loginUrl = new URL("/auth/login", request.nextUrl);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
