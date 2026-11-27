import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  MOBILE_SLUG_PATTERN,
  mobileApiUrl,
  mobileCookieName,
} from "@/lib/mobile/session";

interface RouteContext {
  params: Promise<{ eventSlug: string; path: string[] }>;
}

async function forward(request: NextRequest, context: RouteContext) {
  const { eventSlug, path } = await context.params;

  if (
    !MOBILE_SLUG_PATTERN.test(eventSlug) ||
    path.length === 0 ||
    path.some((segment) => !MOBILE_SLUG_PATTERN.test(segment)) ||
    path[0] === "auth"
  ) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  const cookieName = mobileCookieName(eventSlug);
  const token = request.cookies.get(cookieName)?.value;
  if (token === undefined || token === "") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  const contentType = request.headers.get("content-type");
  if (contentType !== null) {
    headers["Content-Type"] = contentType;
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(
      `${mobileApiUrl(eventSlug, path.join("/"))}${request.nextUrl.search}`,
      {
        method: request.method,
        headers,
        body: body !== undefined && body.byteLength > 0 ? body : undefined,
        cache: "no-store",
        redirect: "manual",
      },
    );
  } catch {
    return NextResponse.json(
      { message: "Upstream unavailable" },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType !== null) {
    responseHeaders.set("Content-Type", upstreamType);
  }
  responseHeaders.set("Cache-Control", "no-store");

  const status = upstream.status;
  const responseBody =
    status === 204 || status === 304 ? null : await upstream.arrayBuffer();
  const response = new NextResponse(responseBody, {
    status,
    headers: responseHeaders,
  });
  if (status === 401) {
    response.cookies.delete(cookieName);
  }
  return response;
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
