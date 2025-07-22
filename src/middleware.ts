import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifySession } from "@/lib/session";

export async function middleware(request: NextRequest) {
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

export const config = {
  matcher: ["/dashboard/:path*"],
};
