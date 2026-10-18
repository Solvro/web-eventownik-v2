import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PaginatedResponse } from "@/lib/api";
import type { Participant } from "@/types/participant";

import { ParticipantsLoader } from "../../participants-loader";
import type { ParticipantPageQuery } from "../../query";
import { Providers } from "./providers";
import { EVENT_UUID } from "./utils";

type GetParticipants = (
  eventUuid: string,
  query: ParticipantPageQuery,
) => Promise<PaginatedResponse<Participant>>;

const backend = vi.hoisted(() => ({
  getParticipants: vi.fn<GetParticipants>(),
  getAttributes: vi.fn<() => Promise<[]>>(),
}));

vi.mock("../../actions", () => ({
  getAttributes: backend.getAttributes,
  getBlocks: vi.fn().mockResolvedValue([]),
  getEmails: vi.fn().mockResolvedValue([]),
  getParticipants: backend.getParticipants,
  deleteManyParticipants: vi.fn(),
}));

const TOTAL = 150;
// The backend orders by email, so registration dates are deliberately not in page order.
const everyone: Participant[] = Array.from({ length: TOTAL }, (_, index) => ({
  uuid: crypto.randomUUID(),
  email: `p${String(index).padStart(3, "0")}@example.com`,
  createdAt: new Date(
    Date.UTC(2026, 0, 1) + (TOTAL - index) * 60_000,
  ).toISOString(),
  attributes: [],
}));

function serverPage(pageNumber: number): PaginatedResponse<Participant> {
  const data = everyone.slice((pageNumber - 1) * 100, pageNumber * 100);
  return {
    data,
    meta: {
      page: pageNumber,
      take: 100,
      itemCount: TOTAL,
      pageCount: 2,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < 2,
    },
  };
}

function renderLoader() {
  // Fail fast instead of React Query's default retry backoff.
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ParticipantsLoader eventUuid={EVENT_UUID} />
    </QueryClientProvider>,
    { wrapper: Providers },
  );
  return { user: userEvent.setup() };
}

beforeEach(() => {
  backend.getAttributes.mockResolvedValue([]);
  backend.getParticipants
    .mockResolvedValueOnce(serverPage(1))
    .mockResolvedValue(serverPage(2));
});

afterEach(() => {
  cleanup();
  backend.getParticipants.mockReset();
  backend.getAttributes.mockReset();
});

// Exercise the loader's scroll callback without relying on jsdom geometry.
vi.mock("../core/participants-table", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../core/participants-table")>();
  return {
    ...original,
    ParticipantTable: (
      props: ComponentProps<typeof original.ParticipantTable>,
    ) => (
      <>
        <original.ParticipantTable {...props} />
        <button onClick={props.onEndReached}>Load more rows</button>
      </>
    ),
  };
});
const loadedMessage =
  "Wczytano 100 z 150. Przewiń, aby zobaczyć kolejnych uczestników.";
describe("ParticipantsLoader native pages", () => {
  it("preserves server order and only requests more on scroll", async () => {
    const { user } = renderLoader();
    await screen.findByText(loadedMessage);
    expect(backend.getParticipants).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("p000@example.com");
    expect(
      screen.getByPlaceholderText("Wyszukaj 150 uczestników..."),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Email" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Data rejestracji" }),
    ).toBeDisabled();
    expect(
      screen.queryByRole("navigation", { name: "Paginacja" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Load more rows" }));
    await screen.findByText("Wczytano wszystkich uczestników (150)");
    expect(
      backend.getParticipants.mock.calls.map(([, query]) => query),
    ).toEqual([
      { page: 1, take: 100, bonusAttributes: [] },
      { page: 2, take: 100, bonusAttributes: [] },
    ]);
  });
  it("selects loaded rows without downloading all participants", async () => {
    const { user } = renderLoader();
    await user.click(
      await screen.findByRole("checkbox", {
        name: "Zaznacz wczytane wiersze (100 z 150)",
      }),
    );
    await screen.findByText("Wybrano 100 z 150");
    expect(
      screen.queryByRole("button", { name: "Zaznacz wszystkich (150)" }),
    ).not.toBeInTheDocument();
    expect(backend.getParticipants).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Load more rows" }));
    await screen.findByText("Wczytano wszystkich uczestników (150)");
    expect(screen.getByText("Wybrano 100 z 150")).toBeInTheDocument();
  });
  it("retries failed attribute loading", async () => {
    backend.getAttributes
      .mockRejectedValueOnce(new Error("503"))
      .mockResolvedValue([]);
    const { user } = renderLoader();
    await screen.findByRole("alert", {
      name: "Nie udało się załadować danych o uczestnikach",
    });
    expect(backend.getParticipants).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    await screen.findByText(loadedMessage);
    expect(backend.getAttributes).toHaveBeenCalledTimes(2);
  });
  it("keeps loaded rows and retries a failed next page", async () => {
    backend.getParticipants
      .mockReset()
      .mockResolvedValueOnce(serverPage(1))
      .mockRejectedValueOnce(new Error("500"))
      .mockResolvedValue(serverPage(2));
    const { user } = renderLoader();
    await screen.findByText(loadedMessage);
    await user.click(screen.getByRole("button", { name: "Load more rows" }));
    await screen.findByRole("alert", {
      name: "Nie udało się wczytać kolejnych uczestników.",
    });
    expect(screen.getAllByRole("row").length).toBeGreaterThan(1);
    await user.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    await waitFor(() => {
      expect(
        screen.getByText("Wczytano wszystkich uczestników (150)"),
      ).toBeInTheDocument();
    });
  });
});
