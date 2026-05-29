import {
  cleanup,
  getAllByRole,
  getByRole,
  getByText,
  screen,
} from "@testing-library/react";
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
    const { user, getDataRow } = renderTable(participants, attributes);

    const firstRow = getDataRow(rowIndexForEditing);

    const editButton = getByRole(firstRow, "button", { name: /edit/i });
    expect(editButton).toBeVisible();

    await user.click(editButton);

    const getTextInput = () => getAllByRole(firstRow, "textbox")[1];
    const getNumberInput = () => getByRole(firstRow, "spinbutton");

    expect(getTextInput()).toHaveValue(editedParticipant.attributes[0].value);
    expect(getNumberInput()).toHaveValue(
      Number(editedParticipant.attributes[1].value),
    );

    const newText = "Testowy text";
    const newNumber = "2137";
    const textInput = getTextInput();
    const numberInput = getNumberInput();

    await user.clear(textInput);
    await user.type(textInput, newText);

    // workaround for number input couldn't be cleared for some reason
    await user.click(numberInput);
    await user.keyboard("{Control>}a{/Control}");
    await user.type(numberInput, newNumber);

    const saveButton = getByRole(firstRow, "button", {
      name: /save/i,
    });
    await user.click(saveButton);
    const toast = screen.getByRole("region");
    expect(toast).toBeVisible();

    expect(getByText(getDataRow(rowIndexForEditing), newText)).toBeVisible();
  });

  // Skipped due to mock strange behavior. Adding mockParticipantsGet will make cells not switch into edit mode.
  // Also mocked error does not appear and edit succeeds
  it.skip("should correctly handle server error when updating participant data", async () => {
    // Test case data contains only attributes of type 'text' and 'number' for simplicity
    // Testing different types of attributes should happen in the AttributeInput's tests
    const { participants, attributes } = editParticipantTestCaseData;
    const { user, getDataRow } = renderTable(participants, attributes);
    server.use(
      http.patch<{ eventId: string; participantId: string }>(
        `${API_URL}/events/:eventId/participants/:participantId`,
        () => {
          return HttpResponse.json({}, { status: 500 });
        },
      ),
    );

    // Step 1: Expand row
    const firstRow = getDataRow(rowIndexForEditing);

    // Step 2: Switch to edit mode
    const editButton = getByRole(firstRow, "button", { name: /edit/i });
    expect(editButton).toBeVisible();
    await user.click(editButton);

    // Step 3: Edit participant
    const getTextInput = () => getAllByRole(firstRow, "textbox")[1];
    const textInput = getTextInput();
    const oldText = textInput.getAttribute("value");

    assert.ok(oldText !== null, "Value of input cannot be null!");

    await user.click(textInput);
    await user.keyboard("{Control>}a{/Control}");
    await user.type(textInput, "Nowy tekst");

    // Step 3: Try to save changes
    const saveButton = getByRole(firstRow, "button", {
      name: /save/i,
    });
    await user.click(saveButton);
    const toast = screen.getByRole("region");
    screen.debug(toast);
    const errorMessage = screen.getByText(/nie udało/i);
    expect(errorMessage).toBeVisible();

    await user.keyboard("{Escape}");
    expect(getByText(getDataRow(rowIndexForEditing), oldText)).toBeVisible();
  });
});
