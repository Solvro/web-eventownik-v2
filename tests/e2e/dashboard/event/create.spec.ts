import { format, parseISO } from "date-fns";
import { randomUUID } from "node:crypto";

import { getEventViaApi } from "../../api-helpers";
import { expect, test } from "../../fixtures";

const testData = {
  name: "E2E Create Test Event",
  location: "Playwright Test Location",
  description: "This is a test event created by Playwright E2E tests.",
  organizer: "KN Solvro E2E",
  contactEmail: "e2e-test@example.org",
  slug: `e2e-create-${randomUUID()}`,
  primaryColor: "#ff5733",
};

test("should create an event", async ({ page, apiRequest, authToken }) => {
  await page.clock.setFixedTime(new Date("2025-08-08T10:00:00"));
  await page.goto("/dashboard/events");
  await page.getByRole("button", { name: "Stwórz wydarzenie" }).click();

  await page.getByRole("textbox", { name: "Nazwa" }).fill(testData.name);

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

  await page.getByRole("textbox", { name: "Miejsce" }).fill(testData.location);
  await page
    .getByRole("textbox", { name: "Organizator" })
    .fill(testData.organizer);
  await page
    .getByRole("textbox", { name: "Email do kontaktu" })
    .fill(testData.contactEmail);

  await page.getByRole("button", { name: "Dalej" }).click();

  await page.getByText("Spersonalizuj wydarzenie").waitFor();
  await page.getByRole("textbox", { name: "Slug" }).fill(testData.slug);
  await page.getByLabel("Kolor wydarzenia").fill(testData.primaryColor);
  await page.getByRole("button", { name: "Dalej" }).click();

  await page.getByText("Dodaj współorganizatorów").waitFor();
  await page.getByRole("button", { name: "Dalej" }).click();

  await page.getByText("Dodaj atrybuty").waitFor();
  await page.getByRole("button", { name: "Dodaj wydarzenie" }).click();

  await expect(
    page.getByText("Dodano nowe wydarzenie", { exact: true }),
  ).toBeVisible();

  const createdEvent = await getEventViaApi(
    apiRequest,
    authToken,
    testData.slug,
  );

  expect(createdEvent.slug).toBe(testData.slug);
  expect(createdEvent.name).toBe(testData.name);
  expect(createdEvent.location).toBe(testData.location);
  expect(createdEvent.organizer).toBe(testData.organizer);
  expect(createdEvent.contactEmail).toBe(testData.contactEmail);
  expect(createdEvent.primaryColor).toBe(testData.primaryColor);

  const startDateLocal = format(
    parseISO(createdEvent.startDate),
    "yyyy-MM-dd HH:mm",
  );
  const endDateLocal = format(
    parseISO(createdEvent.endDate),
    "yyyy-MM-dd HH:mm",
  );
  expect(startDateLocal).toBe("2025-08-13 13:30");
  expect(endDateLocal).toBe("2025-08-14 15:30");
});
