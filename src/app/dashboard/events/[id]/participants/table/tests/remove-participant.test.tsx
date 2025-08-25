import { cleanup, getByRole, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, it } from "vitest";

import { API_URL } from "@/lib/api";
import { server } from "@/tests/msw/node";

import { mockParticipantGet, mockVerifySession } from "./mocks/mocks";
import { deleteParticipantCaseData } from "./mocks/test-cases-data";
import { renderTable } from "./utils";

vi.mock("@/lib/session", () => mockVerifySession());

describe("Removing participant", () => {
  const rowIndexToRemove = 0;
  beforeEach(() => {
    server.use(mockParticipantGet(deleteParticipantCaseData.participants));
    cleanup();
  });

  it("should correctly remove participant", async () => {
    const { participants, attributes } = deleteParticipantCaseData;
    const { user, getDataRow, getExpandedRow, getDataRows } = renderTable(
      participants,
      attributes,
    );

    // Step 1: Expand row to remove
    const row = getDataRow(rowIndexToRemove);
    const expandButton = getByRole(row, "button", {
      name: /rozwiń/i,
    });
    expect(expandButton).toBeVisible();
    await user.click(expandButton);

    // Step 2: Click remove button
    const expandedRow = getExpandedRow(rowIndexToRemove);
    const deleteButton = getByRole(expandedRow, "button", {
      name: /usuń/i,
    });
    expect(deleteButton).toBeVisible();
    await user.click(deleteButton);

    // Step 3: Confirm deletion
    const alertDialog = screen.getByRole("alertdialog");
    expect(alertDialog).toBeVisible();
    const confirmDeletionButton = getByRole(alertDialog, "button", {
      name: /usuń/i,
    });
    expect(confirmDeletionButton).toBeVisible();
    await user.click(confirmDeletionButton);

    const toast = screen.getByText(/usunięto/i);
    expect(toast).toBeVisible();

    // Check if participant was removed
    expect(getDataRows().length).toBeLessThan(participants.length);
  });

  it("should correctly remove selected participants", async () => {
    const { participants, attributes } = deleteParticipantCaseData;
    const { user, getDataRows } = renderTable(participants, attributes);

    // Step 1: Select all rows
    for (const row of getDataRows()) {
      const selectButton = getByRole(row, "checkbox", {
        name: /wybierz wiersz/i,
      });
      await user.click(selectButton);
    }

    // Step 2: Click delete many button
    const deleteManyButton = screen.getByRole("button", {
      name: /usuń zaznaczone/i,
    });
    await user.click(deleteManyButton);

    // Step 3: Confirm deletion
    const alertDialog = screen.getByRole("alertdialog");
    expect(alertDialog).toBeVisible();

    const confirmDeletion = getByRole(alertDialog, "button", {
      name: /usuń/i,
    });
    await user.click(confirmDeletion);

    // No rows should be displayed - we've deleted all
    expect(screen.getByText(/nie znaleziono/i)).toBeVisible();
    expect(getDataRows().length).toBe(0);
  });

  it("should correctly handle server error when removing one participant", async () => {
    const { participants, attributes } = deleteParticipantCaseData;
    const { user, getDataRow, getExpandedRow } = renderTable(
      participants,
      attributes,
    );
    server.use(
      http.delete<{ eventId: string; participantId: string }>(
        `${API_URL}/events/:eventId/participants/:participantId`,
        () => {
          return HttpResponse.json({}, { status: 500 });
        },
      ),
    );

    // Step 1: Expand row to remove
    const row = getDataRow(rowIndexToRemove);
    const expandButton = getByRole(row, "button", {
      name: /rozwiń/i,
    });
    expect(expandButton).toBeVisible();
    await user.click(expandButton);

    // Step 2: Click remove button
    const expandedRow = getExpandedRow(rowIndexToRemove);
    const deleteButton = getByRole(expandedRow, "button", {
      name: /usuń/i,
    });
    expect(deleteButton).toBeVisible();
    await user.click(deleteButton);

    // Step 3: Confirm deletion
    const alertDialog = screen.getByRole("alertdialog");
    expect(alertDialog).toBeVisible();
    const confirmDeletionButton = getByRole(alertDialog, "button", {
      name: /usuń/i,
    });
    expect(confirmDeletionButton).toBeVisible();
    await user.click(confirmDeletionButton);

    // Check for an error
    const toast = screen.getByText(/nie udało/i);
    expect(toast).toBeVisible();
    expect(getExpandedRow(rowIndexToRemove)).toBeVisible();
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

    // Step 1: Select all rows
    for (const row of getDataRows()) {
      const selectButton = getByRole(row, "checkbox", {
        name: /wybierz wiersz/i,
      });
      await user.click(selectButton);
    }

    // Step 2: Click delete many button
    const deleteManyButton = screen.getByRole("button", {
      name: /usuń zaznaczone/i,
    });
    await user.click(deleteManyButton);

    // Step 3: Confirm deletion
    const alertDialog = screen.getByRole("alertdialog");
    expect(alertDialog).toBeVisible();

    const confirmDeletion = getByRole(alertDialog, "button", {
      name: /usuń/i,
    });
    await user.click(confirmDeletion);

    // Every row should be displayed
    const toast = screen.getByText(/nie udało/i);
    expect(toast).toBeVisible();
    expect(getDataRows().length).toBe(participants.length);
  });
});
