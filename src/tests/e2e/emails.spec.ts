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

  test("should create a new template", async ({ page }) => {
    const templateTitle = "New template";
    const saveButton = page.getByRole("button", { name: /zapisz/i });

    await page.getByRole("textbox").first().fill(templateTitle);
    await templatesPage.getEditor().insertText("Message content");
    await saveButton.click();

    await expect(saveButton).toBeDisabled();
    // TODO: I can't seem to verify that the confirmation toast is showing up
    // Tried page.getByRole("status") but it doesn't work
    // await expect(page.getByText("dodano")).toBeVisible();
    await expect(page.getByText(templateTitle)).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

// TODO: Refactor the whole creating and deleting mechanism
// This is very messy because currently all tests need to be run in this specific sequence
// otherwise there will be errors due to more than one template visible
test.describe("Deleting templates", () => {
  test("should delete template", async ({ page }) => {
    await page.getByRole("button", { name: /usuń/i }).click();
    const deleteConfirmation = page.getByRole("dialog");
    await deleteConfirmation.getByRole("button", { name: /usuń/i }).click();
  });
});

test.describe("Editor", () => {
  let editor: Editor;

  test.beforeEach(async ({ page }) => {
    await templatesPage.launchDialog();
    await page.getByRole("button", { name: /dalej/i }).click();
    editor = templatesPage.getEditor();
  });

  test("should allow entering text", async () => {
    await editor.insertText("Lorem ipsum");
    await expect(editor.getFirstParagraph()).toHaveText("Lorem ipsum");
  });

  test("should allow deleting text", async () => {
    await editor.insertText("A");
    await editor.element.press("Backspace");
    await expect(editor.getFirstParagraph()).toBeEmpty();
  });

  test("should create new paragraph pressing 'Enter'", async () => {
    const phrases = ["Lorem ipsum", "Dolor sit amet"];

    await editor.insertText(phrases[0]);
    await editor.element.press("Enter");
    await editor.insertText(phrases[1]);

    const paragraphs = editor.getAllParagraphs();
    await expect(paragraphs).toHaveCount(2);

    await expect(paragraphs.nth(0)).toHaveText(phrases[0]);
    await expect(paragraphs.nth(1)).toHaveText(phrases[1]);
  });

  test("should not create new paragraph pressing 'Shift+Enter'", async () => {
    const phrases = ["Lorem ipsum", "Dolor sit amet"];

    await editor.insertText(phrases[0]);
    await editor.element.press("Shift+Enter");
    await editor.insertText(phrases[1]);

    const paragraphs = editor.getAllParagraphs();
    await expect(paragraphs).toHaveCount(1);

    await expect(paragraphs.nth(0)).toHaveText(`${phrases[0]}${phrases[1]}`);
  });

  test.describe("Formatting with Markdown", () => {
    const marks = [
      {
        effect: "bold",
        characters: "**",
        role: "strong",
      },
      {
        effect: "italic",
        characters: "*",
        role: "emphasis",
      },
      {
        effect: "monospace",
        characters: "`",
        role: "code",
      },
    ] as const;

    const nodes = [
      {
        characters: "#",
        role: "heading",
        level: 1,
      },
      {
        characters: "##",
        level: 2,
      },
      {
        characters: "###",
        level: 3,
      },
    ] as const;

    for (const { effect, characters, role } of marks) {
      test(`should make '${effect}' text with '${characters}'`, async ({
        page,
      }) => {
        const phrase = "Lorem ipsum";
        await editor.insertText(`${characters}${phrase}${characters}`);

        await expect(page.getByRole(role)).toHaveText(phrase);
      });
    }

    for (const { characters, level } of nodes) {
      test(`should make level '${level.toString()}' heading with '${characters}'`, async ({
        page,
      }) => {
        const phrase = "Lorem ipsum";
        await editor.insertText(`${characters} ${phrase}`);

        await expect(page.getByRole("heading", { level }).last()).toHaveText(
          phrase,
        );
      });
    }
  });

  test.describe("Formatting with Menu", () => {
    const marks = [
      {
        effect: "bold",
        button: "bold",
        role: "strong",
      },
      {
        effect: "italic",
        button: "italics",
        role: "emphasis",
      },
      {
        effect: "monospace",
        button: "mono",
        role: "code",
      },
    ] as const;

    const nodes = [
      {
        effect: "heading1",
        button: "headingOne",
        role: "heading",
        level: 1,
      },
      {
        effect: "heading2",
        button: "headingTwo",
        role: "heading",
        level: 2,
      },
      {
        effect: "heading3",
        button: "headingThree",
        role: "heading",
        level: 3,
      },
    ] as const;

    for (const { effect, button, role } of marks) {
      test(`should make '${effect}' text with when pressing '${button}'`, async ({
        page,
      }) => {
        const phrase = "Lorem ipsum";
        await editor.insertText(phrase);
        await editor.selectAll();
        await editor.menu[button].click();

        await expect(page.getByRole(role)).toHaveText(phrase);
      });
    }

    for (const { button, level } of nodes) {
      test(`should make level '${level.toString()}' heading with '${button}'`, async ({
        page,
      }) => {
        const phrase = "Lorem ipsum";
        await editor.insertText(phrase);
        await editor.menu[button].click();

        await expect(page.getByRole("heading", { level }).last()).toHaveText(
          phrase,
        );
      });
    }
  });

  test.describe("Text Alignment", () => {
    const alignmentTestCases = [
      { alignment: "left", button: "alignLeft" },
      { alignment: "center", button: "alignCenter" },
      { alignment: "right", button: "alignRight" },
      { alignment: "justify", button: "justify" },
    ] as const;

    for (const { alignment, button } of alignmentTestCases) {
      test(`should set 'text-align' to '${alignment}' with '${button}'`, async () => {
        await editor.insertText("Lorem ipsum");
        await editor.menu[button].click();

        await expect(editor.getFirstParagraph()).toHaveCSS(
          "text-align",
          alignment,
        );
      });
    }
  });
});
