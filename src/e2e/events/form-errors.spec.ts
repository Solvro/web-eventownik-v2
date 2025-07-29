import { expect, test } from "../fixtures";

const testData = {
  name: "E2E Test Event",
  location: "Playwright",
  description: "This is a test event created by Playwright E2E tests.",
  organizer: "KN Solvro",
  slug: "e2e-test",
};

test.beforeEach(async ({ page }) => {
  // Set the clock to a specific date and time
  await page.clock.setFixedTime(new Date("2025-08-08T10:00:00"));
  // Navigate to the dashboard
  await page.goto("/dashboard");
});

test("should throw errors if the required fields are not set correctly", async ({
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
