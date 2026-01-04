import { createEventViaApi } from "../../api-helpers";
import { expect, test } from "../../fixtures";

test("should show error when trying to use an existing slug", async ({
  page,
  apiRequest,
  authToken,
}) => {
  // Create an event via API to occupy the slug
  const event = await createEventViaApi(apiRequest, authToken);

  await page.clock.setFixedTime(new Date("2025-08-08T10:00:00"));
  await page.goto("/dashboard/events");
  await page.getByRole("button", { name: "Stwórz wydarzenie" }).click();

  await page.getByRole("textbox", { name: "Nazwa" }).fill("New Event");
  await page
    .getByRole("button", { name: /Data i godzina rozpoczęcia/i })
    .first()
    .click();
  await page.getByRole("button", { name: "Wednesday, August 13th," }).click();
  await page
    .getByRole("textbox", { name: "Godzina rozpoczęcia" })
    .fill("13:30");

  await page
    .getByRole("button", { name: /Data i godzina zakończenia/i })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Thursday, August 14th," })
    .last()
    .click();
  await page
    .getByRole("textbox", { name: "Godzina zakończenia" })
    .fill("15:30");
  await page.getByRole("button", { name: "Dalej" }).click();

  await page.getByText("Spersonalizuj wydarzenie").waitFor();
  await page.getByRole("textbox", { name: "Slug" }).fill(event.slug);
  await page.getByRole("button", { name: "Dalej" }).click();

  await expect(page.getByText(/zajęty/i)).toBeVisible();
});
