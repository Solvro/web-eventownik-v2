import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

// NOTE: Probably should be in an .env file
const EVENT_ID = "126";

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
    await this.page.goto(`/dashboard/events/${EVENT_ID}/emails`);
    await this.page.waitForURL(`/dashboard/events/${EVENT_ID}/emails`);
  }

  async launchDialog() {
    await this.page.getByRole("button", { name: /szablon/i }).click();
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

test.describe("Demo suite", () => {
  let templatesPage: TemplatesPage;

  test.beforeEach(async ({ page }) => {
    templatesPage = new TemplatesPage(page);
    await templatesPage.navigateToTemplates();
  });

  test("should render the page", async ({ page }) => {
    await expect(page).toHaveURL(`/dashboard/events/${EVENT_ID}/emails`);
    await expect(
      page.getByRole("heading", { name: /szablony/i }),
    ).toBeVisible();
  });
});
