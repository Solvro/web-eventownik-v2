import type { Locator, Page } from "@playwright/test";

import type { EventAttribute } from "@/types/attributes";
import type { Event } from "@/types/event";
import type { EventForm } from "@/types/forms";

export interface EventData {
  id: Event["id"];
  attributes: Partial<EventAttribute>[];
  forms: Partial<EventForm>[];
}

export const EVENT_DATA: EventData = {
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

export interface Editor {
  /**
   * The ProseMirror root element within the DOM
   */
  element: Locator;
  /**
   * Inserts text into the editor
   */
  insertText: (text: string) => Promise<void>;
  /**
   * Pastes text from the clipboard into the editor
   * @see https://www.adebayosegun.com/snippets/copy-paste-playwright
   */
  pasteText: (text: string) => Promise<void>;
  /**
   * Selects all text in the editor using Ctrl+A shortcut
   */
  selectAll: () => Promise<void>;
  /**
   * Gets the first paragraph within the editor
   */
  getFirstParagraph: () => Locator;
  /**
   * Gets all paragraphs within the editor
   */
  getAllParagraphs: () => Locator;
  /**
   * The menu bar within the editor
   */
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
    imageInput: Locator;
    imageButton: Locator;
    tag: Locator;
  };
}

export class TemplatesPage {
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
    // Getting by testid here to get around multiple textboxes error
    const element = this.page.getByTestId("editor");
    const context = this.page.context();

    return {
      element,
      insertText: async (text: string) => {
        await element.click();
        await this.page.keyboard.type(text);
      },
      pasteText: async (text: string) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        // Focus the editor
        await element.click();
        // Copy text to clipboard
        await this.page.evaluate(async () =>
          navigator.clipboard.writeText(text),
        );
        // Paste text from clipboard
        await element.press("Meta+v");
      },
      selectAll: async () => {
        await element.click();
        await this.page.keyboard.down("Control");
        await this.page.keyboard.press("KeyA");
        await this.page.keyboard.up("Control");
      },
      getFirstParagraph: () => element.getByRole("paragraph").first(),
      getAllParagraphs: () => element.getByRole("paragraph"),
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
        imageInput: this.page.getByRole("button", { name: /zdjęcie/i }).first(),
        imageButton: this.page.getByRole("button", { name: /zdjęcie/i }).last(),
        tag: this.page.getByRole("button", { name: /znacznik/i }),
      },
    };
  }
}
