import { createEventViaApi } from "../../api-helpers";
import { expect, test } from "../../fixtures";

test("should display event details correctly", async ({
  page,
  apiRequest,
  authToken,
}) => {
  const testEvent = {
    name: "E2E Read Test Event",
    location: "Playwright Test Location",
    organizer: "KN Solvro E2E",
    description: "Test event description for read test",
  };

  const event = await createEventViaApi(apiRequest, authToken, testEvent);

  await page.goto(`/dashboard/events/${event.id.toString()}`);

  await expect(
    page.getByRole("heading", { name: testEvent.name }),
  ).toBeVisible();
  await expect(page.getByText(testEvent.location)).toBeVisible();
  await expect(page.getByText(testEvent.organizer)).toBeVisible();
});
