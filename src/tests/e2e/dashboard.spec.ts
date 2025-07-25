import { expect, test } from "@playwright/test";

const testData = {
  name: "E2E Test Event",
  location: "Playwright",
  description: "This is a test event created by Playwright E2E tests.",
  organizer: "KN Solvro",
  slug: "e2e-test",
};

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  // Set the clock to a specific date and time
  await page.clock.setFixedTime(new Date("2025-08-08T10:00:00"));
  // Navigate to the dashboard
  await page.goto("/dashboard");
});

test("should create an event", async ({ page }) => {
  // Open up the event creation modal
  await page.getByRole("button", { name: "Stwórz wydarzenie" }).click();
  // Fill in the event details
  await page.getByRole("textbox", { name: "Nazwa" }).fill(testData.name);
  await page.getByRole("button", { name: "Data i godzina" }).click();
  await page.getByRole("button", { name: "Wednesday, August 13th," }).click();
  await page.locator('input[name="startTime"]').fill("13:30");
  // NOTE: The date picker buttons don't have names, we should add them for easier testing
  await page.getByRole("button", { name: "August 8th," }).first().click();
  await page
    .getByRole("button", { name: "Thursday, August 14th," })
    .last()
    .click();
  await page.locator('input[name="endTime"]').fill("15:30");
  await page
    .getByRole("textbox", { name: "Miejsce (opcjonalnie)" })
    .fill(testData.location);
  await page.getByRole("textbox", { name: "Opis" }).fill(testData.description);
  await page
    .getByRole("textbox", { name: "Organizator (opcjonalnie)" })
    .fill(testData.organizer);
  // Skip the custom fields steps
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByText("Spersonalizuj wydarzenie").waitFor();
  // NOTE: find a way to have unique slugs for each test run
  await page.getByRole("textbox", { name: "Slug" }).fill(testData.slug);
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByText("Dodaj współorganizatorów").waitFor();
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByText("Dodaj atrybuty").waitFor();
  await page.getByRole("button", { name: "Utwórz wydarzenie" }).click();
  // Wait for the event to be created
  await page.waitForURL("/dashboard/events/*");
  // Verify the event information
  await expect(page.locator("h1")).toContainText(testData.name);
  await expect(page.getByRole("main")).toContainText(testData.organizer);
  await expect(page.getByRole("main")).toContainText("13.08.2025 13:30");
  await expect(page.getByRole("main")).toContainText("14.08.2025 15:30");
  await expect(page.getByRole("main")).toContainText(testData.description);
});

test("should throw errors if the fields are not set correctly", async ({
  page,
}) => {
  // Open up the event creation modal
  await page.getByRole("button", { name: "Stwórz wydarzenie" }).click();
  // Try to go to the next step without filling in the name
  await page.getByRole("button", { name: "Dalej" }).click();
  // Verify the error message for missing name is displayed
  await expect(page.getByText(/nazwa nie może być pusta/i)).toBeVisible();
  // Fill in the name
  await page.getByRole("textbox", { name: "Nazwa" }).fill(testData.name);
  // Set a time in the past and try to go to the next step
  await page.locator('input[name="startTime"]').fill("09:00");
  await page.getByRole("button", { name: "Dalej" }).click();
  // Verify the error message for invalid start date is displayed
  await expect(page.getByText(/nie może być w przeszłości/i)).toBeVisible();
  // Set the start date and try to go to the next step without setting the end date
  await page.getByRole("button", { name: "Data i godzina" }).click();
  await page.getByRole("button", { name: "Wednesday, August 13th," }).click();
  await page.getByRole("button", { name: "Dalej" }).click();
  // Verify the error message for invalid end date is displayed
  await expect(page.getByText(/musi być po dacie rozpoczęcia/i)).toBeVisible();
});

test("should throw an error if the event slug is already used", async ({
  page,
}) => {
  // Open up the event creation modal
  await page.getByRole("button", { name: "Stwórz wydarzenie" }).click();
  // Fill in the event details
  await page.getByRole("textbox", { name: "Nazwa" }).fill(testData.name);
  await page.getByRole("button", { name: "Data i godzina" }).click();
  await page.getByRole("button", { name: "Wednesday, August 13th," }).click();
  await page.locator('input[name="startTime"]').fill("13:30");
  await page.getByRole("button", { name: "August 8th," }).first().click();
  await page
    .getByRole("button", { name: "Thursday, August 14th," })
    .last()
    .click();
  await page.locator('input[name="endTime"]').fill("15:30");
  // Skip the custom fields steps
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByText("Spersonalizuj wydarzenie").waitFor();
  // Fill in the slug that is already used
  await page.getByRole("textbox", { name: "Slug" }).fill(testData.slug);
  // Try to go to the next step
  await page.getByRole("button", { name: "Dalej" }).click();
  // Verify the error message is displayed
  await page.getByText(/zajęty/i).waitFor();
  await expect(page.getByText(/zajęty/i)).toBeVisible();
});

test("should delete an event", async ({ page }) => {
  // Navigate to the dashboard
  await page.goto("/dashboard/events");
  await page.getByRole("link", { name: "Wyświetl szczegóły" }).click();
  await page.waitForURL("/dashboard/events/*");
  await page.getByRole("link", { name: "Edytuj wydarzenie" }).click();
  await page.waitForURL("/dashboard/events/*/settings");
  await page.getByRole("button", { name: "Usuń wydarzenie" }).click();
  await page.getByRole("button", { name: "Usuń" }).waitFor();
  await page.getByRole("button", { name: "Usuń" }).click();
  await page.waitForURL("/dashboard/events");
  // Verify the event is deleted
  await expect(page.getByText("Team Meeting")).not.toBeVisible();
});
