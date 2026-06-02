import { cleanup, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe } from "vitest";

import { API_URL } from "@/lib/api";
import * as utils from "@/lib/utils";
import { server } from "@/tests/msw/node";

import { mockVerifySession } from "./mocks/mocks";
import { textCaseData } from "./mocks/test-cases-data";
import { renderTable } from "./utils";

vi.mock("@/lib/session", () => mockVerifySession());

describe("Export data", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should download file with exported data", async () => {
    // Why is that? -> check https://vitest.dev/guide/mocking.html#mock-an-exported-function
    const downloadFileSpy = vi
      .spyOn(utils, "downloadFile")
      .mockImplementation(vi.fn());
    const { participants, attributes } = textCaseData;
    const { user, exportButton } = renderTable(participants, attributes);

    expect(exportButton).toBeVisible();

    await user.click(exportButton);

    expect(downloadFileSpy).toHaveBeenCalledOnce();
  });

  it("should display informative error when server error occurs", async () => {
    server.use(
      http.get<{ eventId: string }>(
        `${API_URL}/events/:eventId/participants/export`,
        () => {
          return HttpResponse.json({}, { status: 500 });
        },
      ),
    );
    const { participants, attributes } = textCaseData;
    const { user, exportButton } = renderTable(participants, attributes);
    expect(exportButton).toBeVisible();

    await user.click(exportButton);

    const toast = screen.getByText(/nie powiódł/i);
    expect(toast).toBeVisible();
  });
});
