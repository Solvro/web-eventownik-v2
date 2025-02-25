import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifySession } from "@/lib/session";

// 1. Specify protected and public routes
const protectedRoutes = new Set(["/dashboard"]);
const publicRoutes = new Set(["/auth/login", "/auth/register", "/"]);

export async function middleware(request: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.has(path);
  const isPublicRoute = publicRoutes.has(path);
  const session = await verifySession();

  // 4. Redirect to /auth/login if the user is not authenticated
  if (isProtectedRoute && session?.bearerToken == null) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }

  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session?.bearerToken != null &&
    !request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: [String.raw`/((?!api|_next/static|_next/image|.*\.png$).*)`],
};
