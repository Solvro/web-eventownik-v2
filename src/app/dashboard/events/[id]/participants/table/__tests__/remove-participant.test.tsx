import { cleanup, getByRole, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, it } from "vitest";

import { API_URL } from "@/lib/api";
import { server } from "@/tests/msw/node";

import {
  mockParticipantGet,
  mockParticipantsGet,
  mockVerifySession,
} from "./mocks/mocks";
import { deleteParticipantCaseData } from "./mocks/test-cases-data";
import { renderTable } from "./utils";

vi.mock("@/lib/session", () => mockVerifySession());

describe("Removing participant", () => {
  beforeEach(() => {
    server.use(mockParticipantGet(deleteParticipantCaseData.participants));
    server.use(mockParticipantsGet(deleteParticipantCaseData.participants));
    cleanup();
  });

  it("should correctly remove selected participants", async () => {
    const { participants, attributes } = deleteParticipantCaseData;
    const { user, getDataRows } = renderTable(participants, attributes);

    for (const row of getDataRows()) {
      const selectButton = getByRole(row, "checkbox", {
        name: /wybierz wiersz/i,
      });
      await user.click(selectButton);
    }

    const deleteManyButton = screen.getByRole("button", {
      name: /usuń zaznaczone/i,
    });

    await user.click(deleteManyButton);

    const alertDialog = screen.getByRole("alertdialog");
    expect(alertDialog).toBeVisible();

    const confirmDeletion = getByRole(alertDialog, "button", {
      name: /usuń/i,
    });

    server.use(mockParticipantsGet([]));

    await user.click(confirmDeletion);

    expect(getDataRows()).toHaveLength(0);
  });

  it("should correctly handle server error when removing many participants", async () => {
    const { participants, attributes } = deleteParticipantCaseData;
    const { user, getDataRows } = renderTable(participants, attributes);
    server.use(
      http.delete<{ eventId: string }>(
        `${API_URL}/events/:eventId/participants`,
        () => {
          return HttpResponse.json({}, { status: 500 });
        },
      ),
    );

    for (const row of getDataRows()) {
      const selectButton = getByRole(row, "checkbox", {
        name: /wybierz wiersz/i,
      });
      await user.click(selectButton);
    }

    const deleteManyButton = screen.getByRole("button", {
      name: /usuń zaznaczone/i,
    });
    await user.click(deleteManyButton);

    const alertDialog = screen.getByRole("alertdialog");
    expect(alertDialog).toBeVisible();

    const confirmDeletion = getByRole(alertDialog, "button", {
      name: /usuń/i,
    });
    await user.click(confirmDeletion);

    expect(getDataRows()).toHaveLength(participants.length);
  });
});
