import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import type { EventAttribute } from "@/types/attributes";
import type { Event } from "@/types/event";
import type { EventForm } from "@/types/forms";

test.describe.configure({ mode: "serial" });

interface EventData {
  id: Event["id"];
  attributes: Partial<EventAttribute>[];
  forms: Partial<EventForm>[];
}

const EVENT_DATA: EventData = {
  id: 126,
  attributes: [
    {
      name: "Numer telefonu",
      type: "tel",
    },
    {
      name: "Rozmiar koszulki",
      type: "select",
      options: ["XS", "S", "M", "L", "XL", "XXL"],
    },
  ],
  forms: [
    {
      name: "Nazwa formularza",
    },
  ],
};

interface Editor {
  editor: Locator;
  insertText: (text: string) => Promise<void>;
  pasteText: (text: string) => Promise<void>;
  selectAll: () => Promise<void>;
  getFirstParagraph: () => Locator;
  getAllParagraphs: () => Locator;
  menu: {
    bold: Locator;
    italics: Locator;
    mono: Locator;
    headingOne: Locator;
    headingTwo: Locator;
    headingThree: Locator;
    alignLeft: Locator;
    alignCenter: Locator;
    alignRight: Locator;
    justify: Locator;
    imageButton: Locator;
    insertTag: Locator;
  };
}

class TemplatesPage {
  constructor(private page: Page) {}

  async navigateToTemplates() {
    await this.page.goto(
      `/dashboard/events/${EVENT_DATA.id.toString()}/emails`,
    );
    await this.page.waitForURL(
      `/dashboard/events/${EVENT_DATA.id.toString()}/emails`,
    );
  }

  async launchDialog() {
    await this.page.getByRole("button", { name: /stwórz/i }).click();
  }

  getEditor(): Editor {
    const editor = this.page.getByRole("textbox");
    const context = this.page.context();

    return {
      editor,
      /**
       * Inserts text into the editor
       */
      insertText: async (text: string) => {
        await editor.click();
        await this.page.keyboard.type(text);
      },
      /**
       * Pastes text from the clipboard into the editor
       * @see https://www.adebayosegun.com/snippets/copy-paste-playwright
       */
      pasteText: async (text: string) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        // Focus the editor
        await editor.click();
        // Copy text to clipboard
        await this.page.evaluate(async () =>
          navigator.clipboard.writeText(text),
        );
        // Paste text from clipboard
        await editor.press("Meta+v");
      },
      /**
       * Selects all text in the editor with Ctrl+A shortcut
       */
      selectAll: async () => {
        await editor.click();
        await this.page.keyboard.down("Control");
        await this.page.keyboard.press("KeyA");
        await this.page.keyboard.up("Control");
      },
      getFirstParagraph: () => this.page.getByRole("paragraph").first(),
      getAllParagraphs: () => this.page.getByRole("paragraph"),
      menu: {
        bold: this.page.getByRole("button", { name: /pogrubienie/i }),
        italics: this.page.getByRole("button", { name: /kursywa/i }),
        mono: this.page.getByRole("button", { name: /mono/i }),
        headingOne: this.page.getByRole("button", { name: /pierwszego/i }),
        headingTwo: this.page.getByRole("button", { name: /drugiego/i }),
        headingThree: this.page.getByRole("button", { name: /trzeciego/i }),
        alignLeft: this.page.getByRole("button", { name: /lewej/i }),
        alignCenter: this.page.getByRole("button", { name: /środka/i }),
        alignRight: this.page.getByRole("button", { name: /prawo/i }),
        justify: this.page.getByRole("button", { name: /just/i }),
        imageButton: this.page.getByRole("button", { name: /zdjęcie/i }),
        insertTag: this.page.getByRole("button", { name: /znacznik/i }),
      },
    };
  }
}

let templatesPage: TemplatesPage;

test.beforeEach(async ({ page }) => {
  templatesPage = new TemplatesPage(page);
  await templatesPage.navigateToTemplates();
});

test.describe("General", () => {
  test("should render the page", async ({ page }) => {
    await expect(page).toHaveURL(
      `/dashboard/events/${EVENT_DATA.id.toString()}/emails`,
    );
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
    const textBoxes = await page.getByRole("textbox").all();

    await expect(page.getByLabel(/tytuł/i)).toBeVisible();
    expect(textBoxes).toHaveLength(2); // NOTE: Title and editor - should it be done differently?
    await expect(page.getByRole("button", { name: /wróć/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /zapisz/i })).toBeVisible();
  });

  test("should force entering in a title", async ({ page }) => {
    await page.getByRole("button", { name: /zapisz/i }).click();

    await expect(page.getByText(/pusty/i)).toBeVisible();
  });
});
