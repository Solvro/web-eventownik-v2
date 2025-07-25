import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:3000/";

class User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;

  constructor() {
    const timestamp = Date.now().toString();
    this.email = `testuser_${timestamp}@test.pl`;
    this.password = `TestHaslo${timestamp}`;
    this.firstName = `TestName${timestamp}`;
    this.lastName = `TestLast${timestamp}`;
  }
}

const TEST_EVENT = {
  name: "Testowy Event E2E",
  description: "To jest testowy event E2E",
  participantsNumber: 100,
};

test.describe.serial("Testowanie głównych funkcji", () => {
  let user: User;
  let uniqueSlug: string;
  let eventName: string;

  test.beforeAll(() => {
    user = new User();
    const timestamp = Date.now().toString();
    uniqueSlug = `testowy-event-e2e-${timestamp}`;
    eventName = `Testowy Event E2E ${timestamp}`;
  });

  test("Testowanie rejestracji", async ({ page }) => {
    await page.goto(`${BASE_URL}auth/register`);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.fill('input[name="firstName"]', user.firstName);
    await page.fill('input[name="lastName"]', user.lastName);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**");
  });

  test("Testowanie wylogowania", async ({ page }) => {
    await page.goto(`${BASE_URL}auth/login`);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**");
    await page.getByRole("button", { name: /wyloguj/i }).click();
    await page.waitForURL(BASE_URL);
  });

  test("Testowanie logowania", async ({ page }) => {
    await page.goto(`${BASE_URL}auth/login`);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**");
  });

  test("Tworzenie eventu przez kreator", async ({ page }) => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 5 * 60 * 1000);
    const endTime = new Date(now.getTime() + 20 * 60 * 1000);

    await page.goto(`${BASE_URL}auth/login`);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**");

    await page.getByRole("button", { name: /stwórz/i }).click();
    await page.locator('[name="name"]').fill(eventName);
    await page
      .getByRole("textbox", { name: /opis/i })
      .fill(TEST_EVENT.description);
    await page.locator('[name="startTime"]').fill(
      startTime.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    await page.locator('[name="endTime"]').fill(
      endTime.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    await page.getByRole("button", { name: /dalej/i }).click();
    await page
      .locator('[name="participantsNumber"]')
      .fill(TEST_EVENT.participantsNumber.toString());
    await page.locator('[name="slug"]').fill(uniqueSlug);
    await page.getByRole("button", { name: /dalej/i }).click();
    await page.getByRole("button", { name: /dalej/i }).click();
    await page.fill('input[name="name"]', "imie");
    await page.locator("button:has(svg.lucide-plus)").click();
    await page.getByRole("button", { name: /zakończ|utwórz|zapisz/i }).click();
    await page.waitForSelector(`text=${eventName}`);
  });

  test("Testowanie tworzenie formularza", async ({ page }) => {
    const now = new Date();
    const startTime = new Date(now.getTime() - 5 * 60 * 1000);
    const endTime = new Date(now.getTime() + 20 * 60 * 1000);

    await page.goto(`${BASE_URL}auth/login`);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**");

    await page.goto(`${BASE_URL}dashboard/events`);
    await page.waitForSelector(`text=${eventName}`);

    await page
      .locator("div", { hasText: eventName })
      .getByRole("link", { name: /Wyświetl szczegóły/i })
      .click();
    await page.waitForURL("**/dashboard/events/**");

    await page.getByRole("link", { name: /Formularze/i }).click();
    await page.waitForURL("**/forms**");

    await page.locator('button:has-text("Stwórz formularz")').click();
    await page.waitForSelector('input[name="name"]');

    await page.fill('input[name="name"]', eventName);
    await page.locator('[name="startTime"]').fill(
      startTime.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    await page.locator('[name="endTime"]').fill(
      endTime.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );

    await page.getByLabel("Formularz rejestracyjny?").click();

    await page.getByRole("button", { name: /dalej/i }).click();
    await page.waitForSelector('button[role="checkbox"]');

    await page
      .locator('button[role="checkbox"][data-state="unchecked"]')
      .click();
    await page.locator('button:has-text("Zapisz")').click();

    await page.waitForURL("**/forms**");
    await page.waitForSelector(`text=${eventName}`);
  });

  test("Testowanie zapisywanie nowego uczestnika", async ({ page }) => {
    await page.goto(`${BASE_URL}${uniqueSlug}`);
    await page.getByRole("textbox", { name: /email/i }).waitFor();
    await page.getByRole("textbox", { name: /email/i }).fill(user.email);
    await page.locator('input[type="text"]').fill(user.firstName);
    await page.locator('button:has-text("Zapisz się")').click();
    await page.waitForSelector("text=Twoja rejestracja przebiegła pomyślnie", {
      timeout: 5000,
    });
  });

  test("Sprawdzenie czy uczestnik został zapisany", async ({ page }) => {
    await page.goto(`${BASE_URL}auth/login`);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**");

    await page.goto(`${BASE_URL}dashboard/events`);
    await page.waitForSelector(`text=${eventName}`);

    await page
      .locator("div", { hasText: eventName })
      .getByRole("link", { name: /Wyświetl szczegóły/i })
      .click();
    await page.waitForURL("**/dashboard/events/**");

    await page.getByRole("link", { name: /Lista uczestników/i }).click();
    await page.waitForURL("**/participants**");

    await page.waitForSelector("table");
    await expect(page.locator(`text=${user.email}`)).toBeVisible();
  });

  test("Testowanie usunięcia wydarzenia", async ({ page }) => {
    await page.goto(`${BASE_URL}auth/login`);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**");

    await page.goto(`${BASE_URL}dashboard/events`);
    await page.waitForSelector(`text=${eventName}`);

    await page
      .locator("div", { hasText: eventName })
      .getByRole("link", { name: /Wyświetl szczegóły/i })
      .click();
    await page.waitForURL("**/dashboard/events/**");

    await page.getByRole("link", { name: /Ustawienia/i }).click();
    await page.waitForURL("**/settings**");

    await page.getByRole("button", { name: /Usuń wydarzenie/i }).click();
    await page.getByRole("button", { name: /Usuń/i }).click();
  });
});
