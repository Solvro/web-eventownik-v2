/* eslint-disable unicorn/prevent-abbreviations */
import { faker } from "@faker-js/faker";
import { cleanup, screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mergeWithDrafts } from "@/hooks/use-participants-data";
import type { PaginatedResponse } from "@/lib/api";
import { API_URL } from "@/lib/api";
import { server } from "@/tests/msw/node";
import type { FlattenedParticipant, Participant } from "@/types/participant";
import type { V3Attribute as Attribute } from "@/types/v3";

import { getParticipants } from "../../actions";
import {
  bonusAttributesParameter,
  defaultColumnVisibility,
  isConsistentSnapshot,
  mergeParticipantPages,
  nextParticipantsPage,
  requiresCompleteList,
  visibleBonusAttributes,
} from "../../query";
import { EVENT_UUID, renderTable } from "./utils";

vi.mock("@/lib/session", () => ({
  verifySession: vi.fn().mockResolvedValue({ bearerToken: "test-access" }),
}));

afterEach(() => {
  cleanup();
});

function attribute(overrides: Partial<Attribute> = {}): Attribute {
  return {
    uuid: faker.string.uuid(),
    eventUuid: EVENT_UUID,
    name: faker.commerce.productName(),
    type: "text",
    showInList: true,
    order: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    config: { options: null },
    ...overrides,
  } as Attribute;
}

function participant(overrides: Partial<Participant> = {}): Participant {
  return {
    uuid: faker.string.uuid(),
    email: faker.internet.email(),
    createdAt: faker.date.past().toISOString(),
    attributes: [],
    ...overrides,
  };
}

function page(
  data: Participant[],
  meta: Partial<PaginatedResponse<Participant>["meta"]> = {},
): PaginatedResponse<Participant> {
  return {
    data,
    meta: {
      page: 1,
      take: 100,
      itemCount: data.length,
      pageCount: 1,
      hasPreviousPage: false,
      hasNextPage: false,
      ...meta,
    },
  };
}

describe("participants listing contract", () => {
  it("only sends query parameters the deployed backend supports", async () => {
    let requested: URL | undefined;
    server.use(
      http.get(
        `${API_URL}/events/${EVENT_UUID}/participants`,
        ({ request }) => {
          requested = new URL(request.url);
          return HttpResponse.json(page([]));
        },
      ),
    );
    const hidden = faker.string.uuid();
    await getParticipants(EVENT_UUID, {
      page: 2,
      take: 100,
      bonusAttributes: [hidden],
    });
    expect(Object.fromEntries(requested?.searchParams ?? [])).toEqual({
      page: "2",
      take: "100",
      bonusAttributes: hidden,
    });
  });

  it("caps bonusAttributes to the backend 1000 character limit", () => {
    const uuids = Array.from({ length: 40 }, () => faker.string.uuid());
    const param = bonusAttributesParameter([...uuids, "not-a-uuid"]);
    expect(param.length).toBeLessThanOrEqual(1000);
    expect(param.split(",")).toHaveLength(27);
    expect(param).not.toContain("not-a-uuid");
  });

  it("requests the next server page only while the backend reports more", () => {
    expect(nextParticipantsPage(page([], { page: 1, hasNextPage: true }))).toBe(
      2,
    );
    expect(nextParticipantsPage(page([], { page: 2 }))).toBeUndefined();
    expect(nextParticipantsPage(null)).toBeUndefined();
  });

  it("deduplicates rows shifted between pages by concurrent changes", () => {
    const shared = participant();
    const first = participant();
    const last = participant();
    expect(
      mergeParticipantPages([page([first, shared]), page([shared, last])]),
    ).toEqual([first, shared, last]);
  });

  it("flags completed snapshots whose pages disagree with each other", () => {
    const rows = Array.from({ length: 4 }, () => participant());
    const consistent = [
      page(rows.slice(0, 2), { itemCount: 4, hasNextPage: true }),
      page(rows.slice(2), { page: 2, itemCount: 4 }),
    ];
    expect(isConsistentSnapshot(consistent)).toBe(true);
    // Totals changed between requests.
    expect(
      isConsistentSnapshot([
        consistent[0],
        page(rows.slice(2), { page: 2, itemCount: 5 }),
      ]),
    ).toBe(false);
    // Offsets shifted: a row repeats across pages and another is skipped.
    expect(
      isConsistentSnapshot([
        consistent[0],
        page([rows[1], rows[2]], { page: 2, itemCount: 4 }),
      ]),
    ).toBe(false);
    // A deletion: fewer distinct rows than the reported total.
    expect(
      isConsistentSnapshot([
        consistent[0],
        page([rows[2]], { page: 2, itemCount: 4 }),
      ]),
    ).toBe(false);
  });

  it("loads the whole list before searching, sorting or filtering", () => {
    const empty = { search: "", sorting: [], columnFilters: [] };
    expect(requiresCompleteList(empty)).toBe(false);
    expect(requiresCompleteList({ ...empty, search: " a " })).toBe(true);
    expect(
      requiresCompleteList({
        ...empty,
        sorting: [{ id: "createdAt", desc: false }],
      }),
    ).toBe(true);
    expect(
      requiresCompleteList({
        ...empty,
        columnFilters: [{ id: "x", value: [] }],
      }),
    ).toBe(false);
    expect(
      requiresCompleteList({
        ...empty,
        columnFilters: [{ id: "x", value: ["VIP"] }],
      }),
    ).toBe(true);
  });
});

describe("hidden-by-default columns", () => {
  it("hides showInList=false attributes by default and only requests revealed ones", () => {
    const shown = attribute();
    const hidden = attribute({ showInList: false });
    const hiddenBlock = attribute({ showInList: false, type: "block" });
    const visibility = defaultColumnVisibility([shown, hidden, hiddenBlock]);
    expect(visibility).toEqual({
      id: false,
      [hidden.uuid]: false,
      [hiddenBlock.uuid]: false,
    });
    expect(
      visibleBonusAttributes([shown, hidden, hiddenBlock], visibility),
    ).toEqual([]);
    expect(
      visibleBonusAttributes([shown, hidden, hiddenBlock], {
        ...visibility,
        [hidden.uuid]: true,
        [hiddenBlock.uuid]: true,
      }),
    ).toEqual([hidden.uuid]);
  });

  it("lists showInList=false attributes in the column menu and lets the user show them", async () => {
    const shown = attribute({ name: "Imię" });
    const hidden = attribute({ name: "Rozmiar koszulki", showInList: false });
    const { user } = renderTable(
      [
        participant({
          attributes: [
            {
              uuid: hidden.uuid,
              name: hidden.name,
              value: "XL",
              createdAt: "2026-01-01",
              updatedAt: "2026-01-01",
            },
          ],
        }),
      ],
      [shown, hidden],
    );
    expect(
      screen.queryByRole("columnheader", { name: /Rozmiar koszulki/ }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Kolumny/ }));
    const item = await screen.findByRole("menuitemcheckbox", {
      name: "Rozmiar koszulki",
    });
    expect(item).not.toBeChecked();
    await user.click(item);
    await user.keyboard("{Escape}");

    const header = await screen.findByRole("columnheader", {
      name: /Rozmiar koszulki/,
    });
    expect(header).toBeInTheDocument();
    const [row] = screen.getAllByRole("row").slice(1);
    expect(within(row).getByText("XL")).toBeInTheDocument();
  });
});

describe("edit drafts on revalidation", () => {
  it("keeps rows being edited while applying fresh server rows", () => {
    const base = {
      createdAt: "2026-01-01",
      wasExpanded: false,
    };
    const draft: FlattenedParticipant = {
      ...base,
      uuid: "a",
      email: "draft@example.com",
      mode: "edit",
    };
    const previous: FlattenedParticipant[] = [
      draft,
      { ...base, uuid: "b", email: "old@example.com", mode: "view" },
    ];
    const next: FlattenedParticipant[] = [
      { ...base, uuid: "a", email: "server@example.com", mode: "view" },
      { ...base, uuid: "b", email: "new@example.com", mode: "view" },
      { ...base, uuid: "c", email: "appended@example.com", mode: "view" },
    ];
    expect(mergeWithDrafts(previous, next)).toEqual([draft, next[1], next[2]]);
  });
});
