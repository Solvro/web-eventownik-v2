import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.pathname.includes("//")) {
    url.pathname = url.pathname.replaceAll(/\/+/g, "/");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
