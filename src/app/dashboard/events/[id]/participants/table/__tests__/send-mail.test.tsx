import {
  cleanup,
  getByRole,
  getByText,
  queryByText,
  screen,
} from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import assert from "node:assert";
import { describe } from "vitest";

import { API_URL } from "@/lib/api";
import { server } from "@/tests/msw/node";
import type { Participant } from "@/types/participant";

import { mockVerifySession } from "./mocks/mocks";
import { textCaseData } from "./mocks/test-cases-data";
import { renderTable } from "./utils";

vi.mock("@/lib/session", () => mockVerifySession());

async function selectUsers(
  participantsToBeSelected: Participant[],
  rows: HTMLElement[],
  user: UserEvent,
) {
  for (const participant of participantsToBeSelected) {
    const rowToSelect = rows.find(
      (row) => queryByText(row, participant.email) !== null,
    );

    assert.ok(
      rowToSelect !== undefined,
      "Row to select not found - something rendered wrong!",
    );

    const selectButton = getByRole(rowToSelect, "checkbox");
    await user.click(selectButton);
  }
}

describe("Send mails", () => {
  beforeAll(() => {
    const mockLocation = {
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...window.location,
      reload: vi.fn(),
      assign: vi.fn(),
      replace: vi.fn(),
    };

    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });
  });
  beforeEach(() => {
    cleanup();
  });

  it("should send emails to selected participants", async () => {
    const { participants, attributes, emails } = textCaseData;
    const { user, sendMailsDialogTrigger, getDataRows } = renderTable(
      participants,
      attributes,
      emails,
    );
    const participantsToBeSelected = participants.slice(0, 2);

    expect(sendMailsDialogTrigger).toBeVisible();

    // Step 1: Select users to whom mail will be sent

    const rows = getDataRows();
    await selectUsers(participantsToBeSelected, rows, user);

    // Step 2: open send mail dialog
    await user.click(sendMailsDialogTrigger);
    const sendMailDialog = screen.getByRole("dialog");
    const sendMailButton = getByRole(sendMailDialog, "button", {
      name: /wyślij/i,
    });
    expect(sendMailDialog).toBeVisible();
    expect(sendMailButton).toBeVisible();
    // TODO Check for selected emails

    // Step 3: Check if selected users' emails are displayed

    for (const participant of participantsToBeSelected) {
      expect(
        getByText(sendMailDialog, new RegExp(participant.email, "i")),
      ).toBeVisible();
    }

    // Step 4: Select mail template
    const mailTemplateSelect = getByRole(sendMailDialog, "combobox");
    expect(mailTemplateSelect).toBeVisible();

    await user.click(mailTemplateSelect);
    const mailTemplateOptions = screen.getAllByRole("option");
    expect(mailTemplateOptions.length).toBe(emails?.length);

    await user.click(mailTemplateOptions[0]);

    // Step 5: Send mail
    await user.click(sendMailButton);

    const toast = screen.getByText(/wysłano/i);
    expect(toast).toBeVisible();
  });

  it("should display informative error when server error occurs", async () => {
    const { participants, attributes, emails } = textCaseData;
    const { user, sendMailsDialogTrigger, getDataRows } = renderTable(
      participants,
      attributes,
      emails,
    );
    const participantsToBeSelected = participants.slice(0, 2);

    server.use(
      http.post<{ eventId: string; emailId: string }>(
        `${API_URL}/events/:eventId/emails/send/:emailId`,
        () => {
          return HttpResponse.json({}, { status: 500 });
        },
      ),
    );

    expect(sendMailsDialogTrigger).toBeVisible();

    // Step 1: Select users to whom mail will be sent

    const rows = getDataRows();
    await selectUsers(participantsToBeSelected, rows, user);

    // Step 2: open send mail dialog
    await user.click(sendMailsDialogTrigger);
    const sendMailDialog = screen.getByRole("dialog");
    const sendMailButton = getByRole(sendMailDialog, "button", {
      name: /wyślij/i,
    });
    getByRole(sendMailDialog, "button", {
      name: /wyślij/i,
    });
    // Step 3: Select mail template
    const mailTemplateSelect = getByRole(sendMailDialog, "combobox");
    await user.click(mailTemplateSelect);
    const mailTemplateOptions = screen.getAllByRole("option");

    await user.click(mailTemplateOptions[0]);

    // Step 4: Send mail
    await user.click(sendMailButton);

    const toast = screen.getByText(/nie udało/i);
    expect(toast).toBeVisible();
  });
});
