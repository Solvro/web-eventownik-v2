import { expect, test } from "@playwright/test";
import { format } from "date-fns";

const AUTH = {
  EMAIL: "284044@student.pwr.edu.pl",
  PASSWD: "Haslomaslo123",
};

const FIELDS = {
  NAME: "Test",
  PLACE: "SKS",
  DESCRIPTION:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget nisi ut turpis tristique mollis vel venenatis nibh.",
  ORGANIZER: "Test Organizer",
  LINK: "https://example.com/",
  SEMI_ORGANIZER: "semiorganizer@test.edu.pl",
  ATTR: "Field",
  SLUG: "test1",
  PARTICIPANTS: "2",
};

const today = new Date();

test.describe("Create event", async () => {
  test("should correctly create an event", async ({ page }) => {
    await page.goto("https://eventownik.solvro.pl/");

    /* Login */
    await page.getByRole("link", { name: "Zaloguj się" }).click();
    await page.getByRole("textbox", { name: "E-mail" }).click();
    await page.getByRole("textbox", { name: "E-mail" }).fill(AUTH.EMAIL);
    await page.getByRole("textbox", { name: "Hasło" }).click();
    await page.getByRole("textbox", { name: "Hasło" }).fill(AUTH.PASSWD);
    await page.getByRole("button", { name: "Kontynuuj" }).click();

    await expect(
      page.getByText("Logowanie zakończone sukcesem!", { exact: true }),
    ).toBeVisible();

    /* Create event */
    const createEventBtn = page.getByRole("button", {
      name: "Stwórz wydarzenie",
    });

    await expect(createEventBtn).toBeVisible();
    await createEventBtn.click();

    const modal = page.getByRole("dialog", { name: "Stwórz formularz" });
    await expect(modal).toBeVisible();

    /* Step 1 */
    const step1 = await page.getByText(/krok [1-9][0-9]*/i);
    await expect(step1).toContainText("1");

    await page.getByRole("textbox", { name: "Nazwa" }).click();
    await page.getByRole("textbox", { name: "Nazwa" }).fill(FIELDS.NAME);

    await page.getByRole("button", { name: format(today, "PPP") }).click();
    const dateDialog = page.locator(".rdp-root");
    await expect(dateDialog).toBeVisible();
    const tomorrow = getFutureDate(24 * 60 * 60 * 1000);
    await dateDialog
      .getByRole("button", { name: format(tomorrow, "PPPP") })
      .click();

    await page.getByRole("textbox", { name: format(today, "HH:mm") });
    await page
      .locator('[id="«rf»-form-item"]')
      .fill(format(getFutureDate(60 * 60 * 1000), "HH:mm"));

    await page.getByRole("textbox", { name: "Miejsce (opcjonalnie)" }).click();
    await page
      .getByRole("textbox", { name: "Miejsce (opcjonalnie)" })
      .fill(FIELDS.PLACE);
    await page.getByRole("textbox", { name: "Opis" }).click();
    await page.getByRole("textbox", { name: "Opis" }).fill(FIELDS.DESCRIPTION);
    await page
      .getByRole("textbox", { name: "Organizator (opcjonalnie)" })
      .click();
    await page
      .getByRole("textbox", { name: "Organizator (opcjonalnie)" })
      .fill(FIELDS.ORGANIZER);

    await page.getByRole("button", { name: "Dalej" }).click();

    /* Step 2 */
    const step2 = await page.getByText(/krok [1-9][0-9]*/i);
    await expect(step2).toContainText("2");

    await page.getByRole("button", { name: "Dodaj Linka" }).click();
    const linkInput = page.getByRole("textbox", { name: "Linki" });
    await expect(linkInput).toBeVisible();
    await linkInput.fill(FIELDS.LINK);

    await page.getByRole("spinbutton", { name: "Liczba uczestników" }).click();
    await page
      .getByRole("spinbutton", { name: "Liczba uczestników" })
      .fill(FIELDS.PARTICIPANTS);
    await page.getByRole("textbox", { name: "Slug" }).fill(FIELDS.SLUG);

    await page.getByRole("button", { name: "Dalej" }).click();

    /* Step 3 */
    const step3 = await page.getByText(/krok [1-9][0-9]*/i);
    await expect(step3).toContainText("3");

    const semiOrganizerField = await page.getByRole("textbox", {
      name: "Wprowadź email współorganizatora",
    });
    await semiOrganizerField.click();
    await semiOrganizerField.fill(FIELDS.SEMI_ORGANIZER);

    await page.getByRole("button", { name: "Dalej" }).click();

    /* Step 4 */
    const step4 = await page.getByText(/krok [1-9][0-9]*/i);
    await expect(step4).toContainText("4");

    const attrField = await page.getByRole("textbox", { name: "Nazwa" });
    await attrField.click();
    await attrField.fill(FIELDS.ATTR);

    await page.getByRole("button", { name: /wydarzenie/i }).click();

    const heading = await page.getByRole("heading", { name: FIELDS.NAME });
    await expect(heading).toBeVisible();
    /* Event created */

    /* Delete created event */
    await page.getByRole("link", { name: "Edytuj wydarzenie" }).click();
    await page.getByRole("button", { name: "Usuń wydarzenie" }).click();
    await page.getByRole("button", { name: "Usuń" }).click();
  });
});

const getFutureDate = (milliseconds: number): Date => {
  return new Date(new Date().getTime() + milliseconds);
};
