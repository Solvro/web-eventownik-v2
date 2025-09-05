import { expect, test } from "@playwright/test";

import { EVENT_DATA, TemplatesPage } from "./utils";

let templatesPage: TemplatesPage;

test.beforeEach(async ({ page }) => {
  templatesPage = new TemplatesPage(page);
  await templatesPage.navigateToTemplates();
});

test.describe("General", () => {
  test("should render the page", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /szablony/i }),
    ).toBeVisible();
  });

  test("should render add template button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /stwórz/i })).toBeVisible();
  });
});

test.describe("Creating templates - 1st step", () => {
  test.beforeEach(async () => {
    await templatesPage.launchDialog();
  });

  test("should show the first step", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /rodzaj/i, level: 2 }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /konfiguruj/i, level: 2 }),
    ).toBeVisible();

    await expect(page.getByRole("radiogroup")).toBeVisible();

    await expect(page.getByRole("button", { name: /dalej/i })).toBeVisible();
  });

  const noConfigTriggers = ["rejestracja", "usunięcie", "manual"];

  for (const trigger of noConfigTriggers) {
    test(`should not show configuration for '${trigger}'`, async ({ page }) => {
      await page.getByRole("radio", { name: new RegExp(trigger, "i") }).click();

      await expect(page.getByText(/nie wymaga/i)).toBeVisible();
    });
  }

  test("should show configuration for 'formularz'", async ({ page }) => {
    await page.getByRole("radio", { name: /formularz/i }).click();
    await page.getByRole("combobox", { name: /formularz/i }).click();

    // The dropdown with options
    await expect(page.getByRole("listbox")).toBeVisible();
    // The option itself
    await expect(
      page.getByRole("option", {
        name: EVENT_DATA.forms[0].name ?? "",
      }),
    ).toBeVisible();
  });

  test("should force configuration for 'formularz'", async ({ page }) => {
    await page.getByRole("radio", { name: /formularz/i }).click();
    await page.getByRole("button", { name: /dalej/i }).click();

    await expect(page.getByText(/pola/i)).toBeVisible();
  });

  test("should show configuration for 'atrybut'", async ({ page }) => {
    await page.getByRole("radio", { name: /atrybut/i }).click();
    await page.getByRole("combobox", { name: /atrybut/i }).click();

    // The dropdown with options
    await expect(page.getByRole("listbox")).toBeVisible();
    // The options themselves
    const options = await page.getByRole("option").all();
    for (const [index, option] of options.entries()) {
      await expect(option).toBeVisible();
      await expect(option).toHaveText(EVENT_DATA.attributes[index].name ?? "");
    }
  });

  test("should force configuration for 'atrybut'", async ({ page }) => {
    await page.getByRole("radio", { name: /atrybut/i }).click();
    await page.getByRole("button", { name: /dalej/i }).click();

    await expect(page.getByText(/pola/i)).toBeVisible();
  });
});

test.describe("Creating templates - 2nd step", () => {
  test.beforeEach(async ({ page }) => {
    await templatesPage.launchDialog();
    await page.getByRole("radio", { name: /manual/i }).click();
    await page.getByRole("button", { name: /dalej/i }).click();
  });

  test("should show the second step", async ({ page }) => {
    const titleInput = page.getByTestId("title");
    const editor = page.getByTestId("editor");

    await expect(page.getByLabel(/tytuł/i)).toBeVisible();
    await expect(titleInput).toBeVisible();
    await expect(editor).toBeVisible();
    await expect(page.getByRole("button", { name: /wróć/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /zapisz/i })).toBeVisible();
  });

  test("should force entering in a title", async ({ page }) => {
    await page.getByRole("button", { name: /zapisz/i }).click();

    await expect(page.getByText(/pusty/i)).toBeVisible();
  });

  test("should create a new template", async ({ page }) => {
    const templateTitle = Date.now().toString();
    const saveButton = page.getByRole("button", { name: /zapisz/i });

    await page.getByRole("textbox").first().fill(templateTitle);
    await templatesPage.getEditor().insertText("Message content");
    await saveButton.click();

    await expect(saveButton).toBeDisabled();
    // TODO: I can't seem to verify that the confirmation toast is showing up
    // Exact method works in editor's "images" suite but doesn't work here
    // await expect(page.getByRole("status")).toHaveText(/dodano/i);
    await expect(page.getByText(templateTitle)).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
