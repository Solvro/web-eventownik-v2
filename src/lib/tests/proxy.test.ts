import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { totalBlockParticipants } from "@/app/dashboard/events/[uuid]/blocks/[blockUuid]/block-counts";
import { API_URL } from "@/lib/api";
import { proxy } from "@/proxy";
import type { Block } from "@/types/blocks";

import { server } from "../../../tests/msw/node";

const session = vi.hoisted(() => ({ bearerToken: "" }));

vi.mock("@/lib/session", () => ({
  verifySession: vi.fn().mockResolvedValue(session),
  encrypt: vi.fn().mockResolvedValue("signed-session"),
}));

function encode(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function blockWithCount(count: unknown) {
  return { blockParticipantCount: count } as unknown as Block;
}

function jwt(expiresInSeconds: number) {
  return `${encode({ alg: "HS256" })}.${encode({
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  })}.signature`;
}

function dashboardRequest() {
  return new NextRequest("http://localhost/dashboard/events", {
    headers: { cookie: "session=stale; backend-refresh=revoked" },
  });
}

function clearedCookies(response: Response) {
  return response.headers
    .getSetCookie()
    .filter((cookie) => /Expires=Thu, 01 Jan 1970|Max-Age=0/i.test(cookie))
    .map((cookie) => cookie.split("=")[0]);
}

describe("dashboard proxy session refresh", () => {
  it("clears stale session cookies when the backend rejects the refresh", async () => {
    session.bearerToken = jwt(-60);
    server.use(
      http.post(`${API_URL}/auth/refresh`, () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );

    const response = await proxy(dashboardRequest());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("/auth/login");
    // Without this the auth layout bounces back to the dashboard forever.
    expect(clearedCookies(response).toSorted()).toEqual([
      "backend-refresh",
      "session",
    ]);
  });

  it("keeps a valid session untouched", async () => {
    session.bearerToken = jwt(3600);

    const response = await proxy(dashboardRequest());

    expect(response.headers.get("location")).toBeNull();
    expect(clearedCookies(response)).toEqual([]);
  });
});

describe("block occupancy totals", () => {
  it("sums known counts", () => {
    expect(
      totalBlockParticipants([
        blockWithCount(10),
        blockWithCount(0),
        blockWithCount(5),
      ]),
    ).toBe(15);
  });

  it("shows an unknown total instead of NaN when the backend omits counts", () => {
    expect(
      totalBlockParticipants([blockWithCount(10), blockWithCount(null)]),
    ).toBe("–");
  });
});
