import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const servePages: GetParticipants = async (_, query) =>
  await Promise.resolve(serverPage(query.page));

function noop() {
  return null;
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
});

afterEach(() => {
  cleanup();
  backend.getParticipants.mockReset();
  backend.getAttributes.mockReset();
});

describe("ParticipantsLoader infinite list", () => {
  it("loads every server page for the default oldest-registration order", async () => {
    backend.getParticipants.mockImplementation(servePages);
    renderLoader();

    expect(
      await screen.findByText("Wczytano wszystkich uczestników (150)"),
    ).toBeInTheDocument();
    // Each page is requested exactly once, with only supported parameters.
    expect(
      backend.getParticipants.mock.calls.map(([, query]) => query),
    ).toEqual([
      { page: 1, take: 100, bonusAttributes: [] },
      { page: 2, take: 100, bonusAttributes: [] },
    ]);
    // The oldest registration lives on the last server page but is shown first.
    const [firstRow] = screen.getAllByRole("row").slice(1);
    expect(firstRow).toHaveTextContent("p149@example.com");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("selects every matching participant across server pages, not just loaded rows", async () => {
    let releaseSecondPage: () => void = noop;
    const secondPageGate = new Promise<void>((resolve) => {
      releaseSecondPage = resolve;
    });
    backend.getParticipants.mockImplementation(async (eventUuid, query) => {
      if (query.page === 2) {
        await secondPageGate;
      }
      return servePages(eventUuid, query);
    });
    const { user } = renderLoader();
    await screen.findByText("Wczytywanie wszystkich uczestników (100 z 150)", {
      exact: false,
    });

    // The header checkbox names what it really selects: loaded rows only.
    expect(
      screen.getByRole("checkbox", {
        name: "Zaznacz wczytane wiersze (100 z 150)",
      }),
    ).toBeInTheDocument();

    const [firstRowCheckbox] = screen.getAllByRole("checkbox", {
      name: "Wybierz wiersz",
    });
    await user.click(firstRowCheckbox);
    await user.click(
      screen.getByRole("button", { name: "Zaznacz wszystkich (150)" }),
    );
    // Only 100 rows are loaded: selection must wait instead of under-selecting.
    expect(screen.queryByText("Wybrano 100 z 150")).not.toBeInTheDocument();

    releaseSecondPage();
    expect(await screen.findByText("Wybrano 150 z 150")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Zaznacz wszystkie wiersze (150)" }),
    ).toBeInTheDocument();
  });

  it("retries the failed attributes request and recovers", async () => {
    backend.getAttributes
      .mockRejectedValueOnce(new Error("Backend request failed (503)"))
      .mockResolvedValue([]);
    backend.getParticipants.mockImplementation(servePages);
    const { user } = renderLoader();

    expect(
      await screen.findByRole("alert", {
        name: "Nie udało się załadować danych o uczestnikach",
      }),
    ).toBeInTheDocument();
    expect(backend.getParticipants).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(
      await screen.findByText("Wczytano wszystkich uczestników (150)"),
    ).toBeInTheDocument();
    expect(backend.getAttributes).toHaveBeenCalledTimes(2);
  });

  it("refuses to treat a shifted snapshot as complete and recovers after refresh", async () => {
    let shifted = true;
    backend.getParticipants.mockImplementation(async (eventUuid, query) => {
      if (shifted && query.page === 2) {
        // A participant registered between the two requests: offsets moved by
        // one, so row 99 repeats and the total no longer matches page 1.
        return {
          data: everyone.slice(99, 150),
          meta: { ...serverPage(2).meta, itemCount: TOTAL + 1 },
        };
      }
      return servePages(eventUuid, query);
    });
    const { user } = renderLoader();

    expect(
      await screen.findByRole("alert", {
        name: /Lista uczestników zmieniła się podczas wczytywania/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Wczytano wszystkich uczestników/),
    ).not.toBeInTheDocument();

    // Select-all must not run as "all matching" on this snapshot.
    const [firstRowCheckbox] = screen.getAllByRole("checkbox", {
      name: "Wybierz wiersz",
    });
    await user.click(firstRowCheckbox);
    await user.click(
      screen.getByRole("button", { name: /Zaznacz wszystkich/ }),
    );
    expect(
      await screen.findByText(/Nie udało się zaznaczyć wszystkich uczestników/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Wybrano 1[45]\d z/)).not.toBeInTheDocument();
    // No automatic refetch loop while the snapshot is inconsistent.
    expect(backend.getParticipants).toHaveBeenCalledTimes(2);

    shifted = false;
    await user.click(screen.getByRole("button", { name: "Odśwież listę" }));
    expect(
      await screen.findByText("Wczytano wszystkich uczestników (150)"),
    ).toBeInTheDocument();
  });

  it("reports a failed next page accessibly and recovers on retry", async () => {
    let failSecondPage = true;
    backend.getParticipants.mockImplementation(async (eventUuid, query) =>
      query.page === 2 && failSecondPage
        ? Promise.reject(new Error("Backend request failed (500)"))
        : servePages(eventUuid, query),
    );
    const { user } = renderLoader();

    const alert = await screen.findByRole("alert", {
      name: "Nie udało się wczytać kolejnych uczestników.",
    });
    expect(alert).toBeInTheDocument();
    // Rows from the first page stay usable.
    expect(screen.getAllByRole("row").length).toBeGreaterThan(1);

    failSecondPage = false;
    await user.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    await waitFor(() => {
      expect(
        screen.getByText("Wczytano wszystkich uczestników (150)"),
      ).toBeInTheDocument();
    });
  });
});
