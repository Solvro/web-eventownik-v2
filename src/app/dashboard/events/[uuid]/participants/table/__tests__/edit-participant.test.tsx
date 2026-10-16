import { cleanup, screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, it } from "vitest";

import { API_URL } from "@/lib/api";
import { server } from "@/tests/msw/node";

import { mockVerifySession } from "./mocks/mocks";
import { editParticipantTestCaseData } from "./mocks/test-cases-data";
import { renderTable } from "./utils";

vi.mock("@/lib/session", () => mockVerifySession());

function renderEditor() {
  const fixture = editParticipantTestCaseData;
  const rendered = renderTable(
    fixture.participants,
    fixture.attributes.map((attribute) => ({ ...attribute, showInList: true })),
  );
  const row = rendered.getDataRow(0);
  return {
    ...rendered,
    row,
    fixture,
    edit: within(row).getByRole("button", { name: "Edytuj" }),
  };
}

describe("native participant editing", () => {
  beforeEach(cleanup);
  it("saves changed text and number zero without sending immutable metadata", async () => {
    let payload: unknown;
    server.use(
      http.patch(
        `${API_URL}/events/:eventUuid/participants/:participantUuid`,
        async ({ request }) => {
          payload = await request.json();
          return HttpResponse.json({});
        },
      ),
    );
    const { user, row, edit, fixture, getDataRow } = renderEditor();
    await user.click(edit);
    const text = within(row).getAllByRole("textbox")[1];
    const number = within(row).getByRole("spinbutton");
    await user.clear(text);
    await user.type(text, "Updated name");
    await user.clear(number);
    await user.type(number, "0");
    await user.click(within(row).getByRole("button", { name: "Zapisz" }));
    expect(await screen.findByText("Updated name")).toBeVisible();
    expect(payload).toEqual({
      participantAttributes: [
        { attributeUuid: fixture.attributes[0].uuid, value: 0 },
        { attributeUuid: fixture.attributes[1].uuid, value: "Updated name" },
      ],
    });
    expect(
      within(getDataRow(0)).getByRole("button", { name: "Edytuj" }),
    ).toBeEnabled();
  });
  it("retains unsaved input and enables retry after a failed save", async () => {
    server.use(
      http.patch(
        `${API_URL}/events/:eventUuid/participants/:participantUuid`,
        () => HttpResponse.json({}, { status: 500 }),
      ),
    );
    const { user, row, edit } = renderEditor();
    await user.click(edit);
    const text = within(row).getAllByRole("textbox")[1];
    await user.clear(text);
    await user.type(text, "Unsaved name");
    const save = within(row).getByRole("button", { name: "Zapisz" });
    await user.click(save);
    expect(
      await screen.findByText(/nie udało się zapisać zmian/i),
    ).toBeVisible();
    expect(text).toHaveValue("Unsaved name");
    expect(save).toBeEnabled();
  });
});
