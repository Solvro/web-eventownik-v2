import { cleanup, screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe } from "vitest";

import { API_URL } from "@/lib/api";

import { mockVerifySession } from "./mocks/mocks";
import { setupMSW } from "./mocks/msw-setup";
import { server } from "./mocks/node";
import { textCaseData } from "./mocks/test-cases-data";
import { renderTable } from "./utils";

setupMSW();

vi.mock("@/lib/session", () => mockVerifySession());

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
    for (const participant of participantsToBeSelected) {
      const rowToSelect = rows.find((row) =>
        row.innerHTML.includes(participant.email),
      );
      if (rowToSelect === undefined) {
        throw new Error("Row to select not found - something rendered wrong!");
      }
      const selectButton = within(rowToSelect).getByRole("checkbox");
      await user.click(selectButton);
    }

    // Step 2: open send mail dialog
    await user.click(sendMailsDialogTrigger);
    const sendMailDialog = screen.getByRole("dialog");
    const sendMailButton = within(sendMailDialog).getByRole("button", {
      name: /wyślij/i,
    });
    expect(sendMailDialog).toBeVisible();
    expect(sendMailButton).toBeVisible();
    // TODO Check for selected emails

    // Step 3: Check if selected users' emails are displayed

    for (const participant of participantsToBeSelected) {
      expect(
        within(sendMailDialog).getByText(new RegExp(participant.email, "i")),
      ).toBeVisible();
    }

    // Step 4: Select mail template
    const mailTemplateSelect = within(sendMailDialog).getByRole("combobox");
    expect(mailTemplateSelect).toBeVisible();

    await user.click(mailTemplateSelect);
    const mailTemplateOptions = screen.getAllByRole("option");
    expect(mailTemplateOptions.length).toBe(emails?.length);

    await user.click(mailTemplateOptions[0]);

    // Step 5: Send mail
    await user.click(sendMailButton);

    const toast = screen.getByText(/pomyślnie/i);
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
    for (const participant of participantsToBeSelected) {
      const rowToSelect = rows.find((row) =>
        row.innerHTML.includes(participant.email),
      );
      if (rowToSelect === undefined) {
        throw new Error("Row to select not found - something rendered wrong!");
      }
      const selectButton = within(rowToSelect).getByRole("checkbox");
      await user.click(selectButton);
    }

    // Step 2: open send mail dialog
    await user.click(sendMailsDialogTrigger);
    const sendMailDialog = screen.getByRole("dialog");
    const sendMailButton = within(sendMailDialog).getByRole("button", {
      name: /wyślij/i,
    });

    // Step 3: Select mail template
    const mailTemplateSelect = within(sendMailDialog).getByRole("combobox");
    await user.click(mailTemplateSelect);
    const mailTemplateOptions = screen.getAllByRole("option");

    await user.click(mailTemplateOptions[0]);

    // Step 4: Send mail
    await user.click(sendMailButton);

    const toast = screen.getByText(/nie udało/i);
    expect(toast).toBeVisible();
  });
});
