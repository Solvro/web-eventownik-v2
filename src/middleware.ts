import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifySession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const session = await verifySession();

  if (session?.bearerToken == null) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }
}

export const config = {
  matcher: ["/dashboard"],
};
