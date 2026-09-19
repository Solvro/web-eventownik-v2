import { createEventViaApi, getEventViaApi } from "../../api-helpers";
import { expect, test } from "../../fixtures";

const updatedData = {
  name: "E2E Update Test Event - Edited",
  location: "Playwright Updated Location",
  organizer: "KN Solvro Updated",
};

test("should update an existing event", async ({
  page,
  apiRequest,
  authToken,
}) => {
  const event = await createEventViaApi(apiRequest, authToken, {
    name: "E2E Update Test Event",
    location: "Original Location",
    organizer: "Original Organizer",
  });

  await page.goto(`/dashboard/events/${event.id.toString()}/settings`);

  await page.getByLabel("Nazwa").clear();
  await page.getByLabel("Nazwa").fill(updatedData.name);
  await page.getByLabel("Miejsce").clear();
  await page.getByLabel("Miejsce").fill(updatedData.location);
  await page.getByRole("textbox", { name: "Organizator" }).clear();
  await page
    .getByRole("textbox", { name: "Organizator" })
    .fill(updatedData.organizer);

  await page.getByRole("button", { name: /Zapisz/i }).click();

  await expect(
    page.getByText("Zapisano zmiany w wydarzeniu", { exact: true }),
  ).toBeVisible();

  const updatedEvent = await getEventViaApi(apiRequest, authToken, event.slug);

  expect(updatedEvent.name).toBe(updatedData.name);
  expect(updatedEvent.location).toBe(updatedData.location);
  expect(updatedEvent.organizer).toBe(updatedData.organizer);
});
