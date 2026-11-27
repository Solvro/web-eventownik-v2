import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  MOBILE_SLUG_PATTERN,
  mobileApiUrl,
  mobileCookieName,
} from "@/lib/mobile/session";

/** Largest request body forwarded: two 8 MB photos plus form overhead */
const MAX_BODY_BYTES = 17 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 30_000;

/**
 * Reads the request body, giving up as soon as it exceeds the limit so an
 * oversized upload is never held in memory. Returns null when it is too large.
 */
async function readLimitedBody(
  request: NextRequest,
): Promise<Uint8Array<ArrayBuffer> | null> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) {
    return null;
  }
  if (request.body === null) {
    return new Uint8Array(0);
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

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

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  // Writes must come from our own pages. Browsers label every request with
  // where it came from; anything sent by another site is refused, even one
  // on a sibling subdomain that the SameSite cookie rule would let through.
  const fetchSite = request.headers.get("sec-fetch-site");
  if (hasBody && (fetchSite === "cross-site" || fetchSite === "same-site")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
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

  const body = hasBody ? await readLimitedBody(request) : undefined;
  if (body === null) {
    return NextResponse.json({ message: "Payload too large" }, { status: 413 });
  }

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
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
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
