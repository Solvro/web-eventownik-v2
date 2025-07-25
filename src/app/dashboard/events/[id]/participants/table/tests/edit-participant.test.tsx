import { cleanup, screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, it } from "vitest";

import { API_URL } from "@/lib/api";
import type { SessionPayload } from "@/types/auth";

import { server } from "./mocks/node";
import {
  editParticipantDetailsTestCaseData,
  editParticipantTestCaseData,
} from "./mocks/test-cases-data";
import { getDataRows, getRow, getSubRow, renderTable } from "./utils";

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => {
  server.close();
});

vi.mock("@/lib/session", () => ({
  verifySession: vi.fn(() => {
    return { bearerToken: "BEARERTOKEN" } as SessionPayload;
  }),
}));

describe("Editing participant", () => {
  const rowIndexForEditing = 0;

  beforeEach(() => {
    cleanup();
  });

  it("should correctly update participant data", async () => {
    // Test case data contains only attributes of type 'text' and 'number' for simplicity
    // Testing different types of attributes should happen in the AttributeInput's tests
    const { participants, attributes } = editParticipantTestCaseData;
    const editedParticipant = {
      ...editParticipantDetailsTestCaseData.participants[0],
    };
    const { user } = renderTable(participants, attributes);

    // Step 1: Expand row for editing
    const firstRow = getRow(rowIndexForEditing);
    const expandButton = within(firstRow).getByRole("button", {
      name: /rozwiń/i,
    });
    expect(expandButton).toBeVisible();
    await user.click(expandButton);

    // Step 2: Switch to edit mode
    const expandedRow = getSubRow(rowIndexForEditing);
    const editButton = within(expandedRow).getByRole("button", {
      name: /edytuj/i,
    });
    expect(editButton).toBeVisible();
    await user.click(editButton);

    const textInput = within(firstRow).getByRole("textbox");
    const numberInput = within(expandedRow).getByRole("spinbutton"); // 'spinbutton' - role for input with type 'number'

    // Check if initial values are correctly set
    expect(textInput).toHaveValue(editedParticipant.attributes[0].value);
    expect(numberInput).toHaveValue(+editedParticipant.attributes[1].value);

    // Step 3: Update participant data
    const newText = "Testowy text";
    const newNumber = "2137";
    await user.clear(textInput);
    await user.type(textInput, newText);
    await user.clear(numberInput);
    await user.type(numberInput, newNumber);

    // Step 4: Save changes
    const saveButton = within(expandedRow).getByRole("button", {
      name: /zapisz/i,
    });
    await user.click(saveButton);
    const toast = screen.getByText(/udana/i);
    expect(toast).toBeVisible();
    expect(expandedRow).not.toBeVisible();

    // Step 5: Check if changes are saved
    await user.click(expandButton);

    expect(within(getRow(rowIndexForEditing)).getByText(newText)).toBeVisible();
    expect(
      within(getSubRow(rowIndexForEditing)).getByText(newNumber),
    ).toBeVisible();
  });

  it("should correctly handle server error when updating participant data", async () => {
    // Test case data contains only attributes of type 'text' and 'number' for simplicity
    // Testing different types of attributes should happen in the AttributeInput's tests
    const { participants, attributes } = editParticipantTestCaseData;
    const { user } = renderTable(participants, attributes);
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
    const expandButton = within(firstRow).getByRole("button", {
      name: /rozwiń/i,
    });
    expect(expandButton).toBeVisible();
    await user.click(expandButton);

    // Step 2: Switch to edit mode
    const expandedRow = getSubRow(rowIndexForEditing);
    const editButton = within(expandedRow).getByRole("button", {
      name: /edytuj/i,
    });
    expect(editButton).toBeVisible();
    await user.click(editButton);

    // Step 3: Edit participant
    const textInput = within(firstRow).getByRole("textbox");
    const oldText = textInput.getAttribute("value");
    if (oldText === null) {
      throw new Error("Value of input cannot be null!");
    }
    await user.clear(textInput);
    await user.type(textInput, "Nowy tekst");

    // Step 3: Try to save changes
    const saveButton = within(expandedRow).getByRole("button", {
      name: /zapisz/i,
    });
    await user.click(saveButton);
    const toast = screen.getByText(/nie powiodła/i);
    expect(toast).toBeVisible();

    // Step 4: Cancel editing
    const cancelButton = screen.getByRole("button", { name: /anuluj/i });
    await user.click(cancelButton);
    expect(within(getRow(rowIndexForEditing)).getByText(oldText)).toBeVisible();
  });
});
