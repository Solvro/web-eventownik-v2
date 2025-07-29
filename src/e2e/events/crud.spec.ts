import { randomUUID } from "node:crypto";

import { expect, test } from "../fixtures";

const testData = {
  name: randomUUID(),
  location: "Playwright",
  description: "This is a test event created by Playwright E2E tests.",
  organizer: "KN Solvro",
  slug: randomUUID(),
};

test.beforeEach(async ({ page }) => {
  // Set the clock to a specific date and time
  await page.clock.setFixedTime(new Date("2025-08-08T10:00:00"));
  // Navigate to the dashboard
  await page.goto("/dashboard");
});

test("event CRUD", async ({ page }) => {
  await test.step("should create an event", async () => {
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
    await page
      .getByRole("textbox", { name: "Opis" })
      .fill(testData.description);
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

  /**
   * NOTE: This is that one test which needs to be run after the event creation test,
   * because it checks for the slug that is already used.
   * The problem is that if this one fails somehow, the deletion test will not be able to run,
   * and the event will remain in the database, making the next test runs fail.
   * For now I have no idea how to solve this issue - Maciej
   */
  await test.step("should throw an error if the event slug is already used", async () => {
    // Navigate to the dashboard
    await page.goto("/dashboard");
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
  await test.step("should delete an event", async () => {
    // Navigate to the dashboard
    await page.goto("/dashboard/events");
    await page.getByRole("link", { name: "Wyświetl szczegóły" }).last().click();
    await page.waitForURL("/dashboard/events/*");
    await page.getByRole("link", { name: "Edytuj wydarzenie" }).click();
    await page.waitForURL("/dashboard/events/*/settings");
    await page.getByRole("button", { name: "Usuń wydarzenie" }).click();
    await page.getByRole("button", { name: "Usuń" }).waitFor();
    await page.getByRole("button", { name: "Usuń" }).click();
    await page.waitForURL("/dashboard/events");
    // Verify the event is deleted
    await expect(page.getByText(testData.name)).not.toBeVisible();
  });
});
