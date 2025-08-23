import { cleanup, getByRole, getByText, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import assert from "node:assert";
import { describe, it } from "vitest";

import { API_URL } from "@/lib/api";
import { server } from "@/tests/msw/node";

import { mockParticipantGet, mockVerifySession } from "./mocks/mocks";
import {
  editParticipantDetailsTestCaseData,
  editParticipantTestCaseData,
} from "./mocks/test-cases-data";
import { renderTable } from "./utils";

vi.mock("@/lib/session", () => mockVerifySession());

describe("Editing participant", () => {
  const rowIndexForEditing = 0;

  beforeEach(() => {
    server.use(
      mockParticipantGet(editParticipantDetailsTestCaseData.participants),
    );
    cleanup();
  });

  it("should correctly update participant data", async () => {
    // Test case data contains only attributes of type 'text' and 'number' for simplicity
    // Testing different types of attributes should happen in the AttributeInput's tests
    const { participants, attributes } = editParticipantTestCaseData;
    const editedParticipant = {
      ...editParticipantDetailsTestCaseData.participants[0],
    };
    const { user, getDataRow, getExpandedRow } = renderTable(
      participants,
      attributes,
    );

    // Step 1: Expand row for editing
    const firstRow = getDataRow(rowIndexForEditing);
    const expandButton = getByRole(firstRow, "button", {
      name: /rozwiń/i,
    });
    expect(expandButton).toBeVisible();
    await user.click(expandButton);

    // Step 2: Switch to edit mode
    const expandedRow = getExpandedRow(rowIndexForEditing);
    const editButton = getByRole(expandedRow, "button", {
      name: /edytuj/i,
    });
    expect(editButton).toBeVisible();
    await user.click(editButton);

    const textInput = getByRole(firstRow, "textbox");
    const numberInput = getByRole(expandedRow, "spinbutton"); // 'spinbutton' - role for input with type 'number'

    // Check if initial values are correctly set
    expect(textInput).toHaveValue(editedParticipant.attributes[0].value);
    expect(numberInput).toHaveValue(
      Number(editedParticipant.attributes[1].value),
    );

    // Step 3: Update participant data
    const newText = "Testowy text";
    const newNumber = "2137";
    await user.clear(textInput);
    await user.type(textInput, newText);
    await user.clear(numberInput);
    await user.type(numberInput, newNumber);

    // Step 4: Save changes
    const saveButton = getByRole(expandedRow, "button", {
      name: /zapisz/i,
    });
    await user.click(saveButton);
    const toast = screen.getByText(/udana/i);
    expect(toast).toBeVisible();
    expect(expandedRow).not.toBeVisible();

    // Step 5: Check if changes are saved
    await user.click(expandButton);

    expect(getByText(getDataRow(rowIndexForEditing), newText)).toBeVisible();
    expect(
      getByText(getExpandedRow(rowIndexForEditing), newNumber),
    ).toBeVisible();
  });

  it("should correctly handle server error when updating participant data", async () => {
    // Test case data contains only attributes of type 'text' and 'number' for simplicity
    // Testing different types of attributes should happen in the AttributeInput's tests
    const { participants, attributes } = editParticipantTestCaseData;
    const { user, getDataRow, getExpandedRow, getDataRows } = renderTable(
      participants,
      attributes,
    );
    server.use(
      http.put<{ eventId: string; participantId: string }>(
        `${API_URL}/events/:eventId/participants/:participantId`,
        () => {
          return HttpResponse.json({}, { status: 500 });
        },
      ),
    );

    // Step 1: Expand row
    const firstRow = getDataRows()[rowIndexForEditing];
    const expandButton = getByRole(firstRow, "button", {
      name: /rozwiń/i,
    });
    expect(expandButton).toBeVisible();
    await user.click(expandButton);

    // Step 2: Switch to edit mode
    const expandedRow = getExpandedRow(rowIndexForEditing);
    const editButton = getByRole(expandedRow, "button", {
      name: /edytuj/i,
    });
    expect(editButton).toBeVisible();
    await user.click(editButton);

    // Step 3: Edit participant
    const textInput = getByRole(firstRow, "textbox");
    const oldText = textInput.getAttribute("value");

    assert.ok(oldText !== null, "Value of input cannot be null!");

    await user.clear(textInput);
    await user.type(textInput, "Nowy tekst");

    // Step 3: Try to save changes
    const saveButton = getByRole(expandedRow, "button", {
      name: /zapisz/i,
    });
    await user.click(saveButton);
    const toast = screen.getByText(/nie udało/i);
    expect(toast).toBeVisible();

    // Step 4: Cancel editing
    const cancelButton = screen.getByRole("button", { name: /anuluj/i });
    await user.click(cancelButton);
    expect(getByText(getDataRow(rowIndexForEditing), oldText)).toBeVisible();
  });
});
