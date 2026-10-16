import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../../../tests/msw/node";
import { API_URL } from "../api";
import type { PaginatedResponse } from "../api";
import {
  BackendError,
  getBackend,
  getReferenceCollection,
  pageNumber,
  pageSize,
  paginatedUrl,
} from "../backend";

describe("native backend requests", () => {
  it("keeps response fields and page metadata unchanged and makes one request", async () => {
    const pages: string[] = [];
    const body = {
      data: [
        {
          uuid: "event",
          organizerName: "Organizer",
          participantsLimit: 30,
          isVerified: true,
        },
      ],
      meta: {
        page: 2,
        take: 1,
        itemCount: 3,
        pageCount: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    };
    server.use(
      http.get(`${API_URL}/events`, ({ request }) => {
        pages.push(new URL(request.url).searchParams.get("page") ?? "");
        return HttpResponse.json(body);
      }),
    );
    const result = await getBackend<PaginatedResponse<unknown>>(
      paginatedUrl(`${API_URL}/events`, 2, 1),
    );
    expect(result).toEqual(body);
    expect(pages).toEqual(["2"]);
  });
  it("loads all pages only when a reference collection explicitly asks for them", async () => {
    const pages: number[] = [];
    server.use(
      http.get(`${API_URL}/events/event/attributes`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page"));
        pages.push(page);
        return HttpResponse.json({
          data: [{ uuid: `field-${String(page)}` }],
          meta: { hasNextPage: page === 1 },
        });
      }),
    );
    expect(
      await getReferenceCollection(`${API_URL}/events/event/attributes`),
    ).toEqual([{ uuid: "field-1" }, { uuid: "field-2" }]);
    expect(pages).toEqual([1, 2]);
  });
  it("rejects a failed request without disguising it as an empty list", async () => {
    server.use(
      http.get(`${API_URL}/events`, () =>
        HttpResponse.json({ message: "Forbidden" }, { status: 403 }),
      ),
    );
    await expect(getBackend(`${API_URL}/events`)).rejects.toEqual(
      new BackendError(403),
    );
  });
  it("validates page and take query values", () => {
    for (const value of ["0", "-1", "1.2", "wat", ["2", "3"]]) {
      expect(pageNumber(value)).toBe(1);
    }
    expect(pageNumber("2")).toBe(2);
    for (const value of ["0", "101", "wat"]) {
      expect(pageSize(value)).toBe(20);
    }
    expect(pageSize("2")).toBe(2);
  });
});
