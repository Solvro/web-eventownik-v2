import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifySession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  // 2. Check if the current route is protected or public
  const session = await verifySession();

  // 4. Redirect to /auth/login if the user is not authenticated
  if (session?.bearerToken == null) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|auth|event|_next/static|_next/image|favicon.ico|$).*)"],
};
